import os
import logging
import asyncio
import json
import jwt

from fastapi import APIRouter , HTTPException , Depends , UploadFile , File , Query
from sqlmodel import Session , select
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from database import get_session
from models import Job , Avatar
from services.auth import get_current_user, CurrentUser, decode_supabase_token
from services.generator import process_jobs, STYLES
from services.imagekit_service import get_variants , upload_file
from config import SUPABASE_JWT_SECRET

logger = logging.getLogger(__name__) 

router = APIRouter(prefix="/api")

# Request / Response Schemas

class CreateJobRequest(BaseModel):
    prompt: str
    selected_styles: list[str]  # e.g. ["anime_hero", "cyberpunk_hacker"]
    headshot_url: str
    headshot_file_id: str      

class CreateJobResponse(BaseModel):
    job_id: str

class AvatarResponse(BaseModel):
    id: str
    style_name: str
    imagekit_url: str | None
    status: str
    error_message: str | None
    variants: dict | None = None 

class JobResponse(BaseModel):
    id: str
    prompt: str
    num_avatars: int
    headshot_url: str | None    # Can be None if deleted after 24h
    headshot_deleted: bool
    status: str
    avatars: list[AvatarResponse]

# Helper function specifically for SSE authentication via query params
def verify_sse_token(token: str) -> str:
    try:
        payload = decode_supabase_token(token)
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token subject")
        return user_id
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Unauthorized: {str(e)}")

# Endpoints

@router.post("/upload-headshot")
async def upload_headshot(
    file: UploadFile = File(...), 
    current_user: CurrentUser = Depends(get_current_user)
): 
    contents = await file.read()
    url, file_id = upload_file(
        file_bytes=contents,
        file_name=file.filename,
        folder="headshots",
        content_type=file.content_type or "image/png"
    )
    return {"url": url, "file_id": file_id}

@router.post("/job", response_model=CreateJobResponse)
async def create_job(
    request: CreateJobRequest, 
    session: Session = Depends(get_session), 
    current_user: CurrentUser = Depends(get_current_user)
):
    # Validate selected styles
    if not request.selected_styles:
        raise HTTPException(status_code=400, detail="Must select at least one style")
    
    for style in request.selected_styles:
        if style not in STYLES:
            raise HTTPException(status_code=400, detail=f"Invalid style: {style}")

    # Enforce Free Tier limitations
    if current_user.tier == "free":
        # 1. Limit to a maximum of 3 styles in the job
        if len(request.selected_styles) > 3:
            raise HTTPException(
                status_code=403, 
                detail="Free tier is limited to selecting at most 3 styles. Upgrade to Premium for more!"
            )
            
        # 2. Check if they have already created a job in the database
        existing_job = session.exec(
            select(Job).where(Job.user_id == current_user.user_id)
        ).first()
        
        if existing_job is not None:
            raise HTTPException(
                status_code=403, 
                detail="You have already used your 1 free generation. Please upgrade to the Premium plan for unlimited generations!"
            )
            
    job = Job(
        user_id=current_user.user_id,
        prompt=request.prompt,
        num_avatars=len(request.selected_styles),
        headshot_url=request.headshot_url,
        headshot_file_id=request.headshot_file_id,
        headshot_deleted=False
    )
    session.add(job)
    session.commit()

    for style in request.selected_styles:
        avatar = Avatar(
            job_id=job.id,
            style_name=style,
        )
        session.add(avatar)
    session.commit()

    # Fire and forget avatar generation
    asyncio.create_task(process_jobs(job.id))

    return CreateJobResponse(job_id=job.id)

@router.get("/jobs", response_model=list[JobResponse])
def get_user_jobs(
    session: Session = Depends(get_session), 
    current_user: CurrentUser = Depends(get_current_user)
):
    jobs = session.exec(
        select(Job).where(Job.user_id == current_user.user_id).order_by(Job.created_at.desc())
    ).all()

    response = []
    for job in jobs:
        avatars = session.exec(
            select(Avatar).where(Avatar.job_id == job.id)
        ).all()

        avatar_responses = []
        for av in avatars:
            variants = get_variants(av.imagekit_url) if av.imagekit_url else None
            avatar_responses.append(
                AvatarResponse(
                    id=av.id,
                    style_name=av.style_name,
                    imagekit_url=av.imagekit_url,
                    status=av.status,
                    error_message=av.error_message,
                    variants=variants,
                )
            )
        response.append(
            JobResponse(
                id=job.id,
                prompt=job.prompt,
                num_avatars=job.num_avatars,
                headshot_url=job.headshot_url,
                headshot_deleted=job.headshot_deleted,
                status=job.status,
                avatars=avatar_responses
            )
        )
    return response

@router.get("/jobs/{job_id}", response_model=JobResponse)
def get_job(
    job_id: str, 
    session: Session = Depends(get_session), 
    current_user: CurrentUser = Depends(get_current_user)
):
    job = session.get(Job, job_id)
    if not job or job.user_id != current_user.user_id:
        raise HTTPException(status_code=404, detail="Job not found")
    
    avatars = session.exec(
        select(Avatar).where(Avatar.job_id == job_id)
    ).all()

    avatar_responses = []
    for av in avatars:
        variants = get_variants(av.imagekit_url) if av.imagekit_url else None
        avatar_responses.append(
            AvatarResponse(
                id=av.id,
                style_name=av.style_name,
                imagekit_url=av.imagekit_url,
                status=av.status,
                error_message=av.error_message,
                variants=variants
            )
        )
    return JobResponse(
        id=job.id,
        prompt=job.prompt,
        num_avatars=job.num_avatars,
        headshot_url=job.headshot_url,
        headshot_deleted=job.headshot_deleted,
        status=job.status,
        avatars=avatar_responses
    )

@router.get("/jobs/{job_id}/stream")
async def stream_job(
    job_id: str,
    token: str = Query(..., description="JWT Bearer Token for SSE auth")
):
    current_user_id = verify_sse_token(token)

    async def event_generator():
        from database import engine
        sent_avatars = set()
        while True:
            with Session(engine) as session: 
                job = session.get(Job, job_id)
                if not job or job.user_id != current_user_id:
                    yield f"event: error\ndata: {json.dumps({'error' : 'Job not found'})}\n\n"
                    return
                
                avatars = session.exec(
                    select(Avatar).where(Avatar.job_id == job_id)
                ).all()

                for av in avatars:
                    if av.id in sent_avatars:
                        continue
                    if av.status == "completed":
                        variants = get_variants(av.imagekit_url) if av.imagekit_url else None
                        data = json.dumps({
                            "avatar_id": av.id,
                            "style_name": av.style_name,
                            "imagekit_url": av.imagekit_url,
                            "variants": variants
                        })
                        yield f"event: avatar_ready\ndata: {data}\n\n"
                        sent_avatars.add(av.id)
                    elif av.status == "failed":
                        data = json.dumps({
                            "avatar_id": av.id,
                            "style_name": av.style_name,
                            "error_message": av.error_message
                        })
                        yield f"event: avatar_failed\ndata: {data}\n\n"
                        sent_avatars.add(av.id)

            all_done = all(av.status in ["completed", "failed"] for av in avatars) 
            if all_done and len(sent_avatars) == len(avatars):
                yield f"event: job_completed\ndata: {json.dumps({'job_id' : job_id , 'status' : job.status})}\n\n"
                return
            
            await asyncio.sleep(2)

    return StreamingResponse(
        event_generator(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive", 
            "X-Accel-Buffering": "no"
        }
    )