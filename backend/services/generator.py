import asyncio
import logging

from sqlmodel import Session, select
from database import engine
from models import Job, Avatar
from services.image_service import generate_Avatar
from services.imagekit_service import upload_file

logger = logging.getLogger(__name__) 

STYLES = {
    "professional_founder": (
        "Create a professional, high-quality corporate headshot. The subject should be dressed in "
        "elegant business or business-casual attire, looking confident, capable, and friendly. "
        "The lighting should be soft and professional (studio portrait lighting), with a modern, "
        "subtly blurred office or workspace background. Clean, polished, and premium personal branding aesthetic."
    ),
    "anime_hero": (
        "Transform the subject into a stylized anime character. The aesthetic should be modern, "
        "high-quality anime/manga art style, reminiscent of top-tier studios like Ufotable or CoMix Wave. "
        "Incorporate vibrant colors, expressive stylized eyes, detailed hair, and an epic, dramatic backdrop "
        "with fantasy or action elements. Highly artistic and dynamic composition."
    ),
    "cyberpunk_hacker": (
        "Transform the subject into a cyberpunk hacker in a futuristic neon-lit city. Use dramatic "
        "neon lighting (cyan, magenta, and purple glows), reflections, and high tech-aesthetics. "
        "The background should feature holographic screens, digital code overlays, and a dark, moody cyber-grid "
        "environment. The subject should look edgy and technologically enhanced."
    ),
    "gaming_streamer": (
        "Create a vibrant, high-energy gaming streamer avatar. The subject should be placed in front of "
        "a professional gaming setup with colorful RGB lighting, a studio microphone, and gaming monitors. "
        "Use expressive, energetic facial expressions, bold color contrasts, and a fun, modern "
        "channel banner aesthetic."
    ),
    "cinematic_celebrity": (
        "Create a stunning, red-carpet cinematic celebrity portrait. The subject should have premium styling, "
        "flawless studio makeup/hair, and be illuminated by dramatic, high-end cinema lighting. "
        "The background should feature a luxurious red carpet or premiere backdrop with soft, blurred bokeh lights "
        "and camera flashes. High-fashion, glamorous, and premium look."
    ),
    "luxury_ceo": (
        "Create a premium, high-status luxury portrait. The subject should look sophisticated, wearing "
        "bespoke luxury clothing. The environment should exude extreme wealth and success—such as a "
        "minimalist luxury penthouse suite, private jet interior, or modern high-end architectural backdrop. "
        "Use rich, dark tones, gold highlights, elegant composition, and sharp depth-of-field."
    )
}
STYLE_ORDER = [
    "professional_founder",
    "anime_hero",
    "cyberpunk_hacker",
    "gaming_streamer",
    "cinematic_celebrity",
    "luxury_ceo"
] 

async def generate_single_Avatar(Avatar_id: str , prompt: str , headshot_url: str):
    # db mark -> Avatar is there in process queue hence mark it as processing
    with Session(engine) as session:
        avat = session.get(Avatar,Avatar_id)
        avat.status = "processing"
        style_name = avat.style_name
        session.add(avat)
        session.commit()

    style_prompt = STYLES[style_name]
    # ai call -> generate Avatar using openai
    try:
        image_byte = await generate_Avatar(prompt , style_prompt , headshot_url)
        with Session(engine) as session:
            avat = session.get(Avatar,Avatar_id)
            job_id = avat.job_id
    # upload to imagekit -> upload the generated Avatar to imagekit and get the url
        url, _ = upload_file(
            file_bytes = image_byte,
            file_name = f"{Avatar_id}.png",
            folder = f"Avatars/{job_id}/",
        )
    # db mark -> mark the Avatar as completed and save the url in db
        with Session(engine) as session:
            avat = session.get(Avatar,Avatar_id)
            avat.imagekit_url = url
            avat.status = "completed"
            session.add(avat)
            session.commit()

        logger.info(f"Avatar {Avatar_id} generated and uploaded successfully")

    except Exception as e:
        logger.error(f"Error processing Avatar {Avatar_id}: {str(e)}")
        with Session(engine) as session:
            avat = session.get(Avatar,Avatar_id)
            avat.status = "failed"
            avat.error_message = str(e)[:500] 
            session.add(avat)
            session.commit()

async def process_jobs(job_id: str):
    #mark job as processing
    #fetch job details and Avatar details from db
    #start one worker for each Avatar
    with Session(engine) as session:
        job = session.get(Job , job_id)
        job.status = "processing"
        prompt = job.prompt
        headshot_url = job.headshot_url
        session.add(job)
        session.commit()

        Avatars = session.exec(
            select(Avatar).where(Avatar.job_id == job_id)
        ).all()
        Avatars_ids = [a.id for a in Avatars]

        tasks = [
                generate_single_Avatar(aid , prompt , headshot_url)
                for aid in Avatars_ids
        ]

        await asyncio.gather(*tasks , return_exceptions=True) #runs alll fo generate_single_Avatar concurrently and waits for all of them to finish

        with Session(engine) as session:
            job = session.get(Job , job_id)
            all_Avatars = session.exec(
                select(Avatar).where(Avatar.job_id == job_id)
            ).all()
            all_failed = all(a.status == "failed" for a in all_Avatars)  
            job.status = "failed" if all_failed else "completed"  
            session.add(job)
            session.commit()
