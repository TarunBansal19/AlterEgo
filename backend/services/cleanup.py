import asyncio
import logging
from datetime import datetime, timezone, timedelta
from sqlmodel import Session, select
from database import engine
from models import Job
from services.imagekit_service import delete_file

logger = logging.getLogger(__name__)

async def cleanup_expired_headshots():
    logger.info("Starting background headshot cleanup task loop.")
    while True:
        try:
            # Query for expired jobs (created more than 24 hours ago, not deleted yet, and has a file ID)
            cutoff_time = datetime.now(timezone.utc) - timedelta(hours=24)
            
            with Session(engine) as session:
                statement = select(Job).where(
                    Job.created_at <= cutoff_time,
                    Job.headshot_deleted.is_(False),
                    Job.headshot_file_id.is_not(None),
                    Job.headshot_file_id != ""
                )
                expired_jobs = session.exec(statement).all()
                
                if expired_jobs:
                    logger.info(f"Found {len(expired_jobs)} expired headshots to delete.")
                    
                for job in expired_jobs:
                    try:
                        if job.headshot_file_id:
                            logger.info(f"Deleting headshot for job {job.id} (file_id: {job.headshot_file_id})")
                            delete_file(job.headshot_file_id) 
                        
                        job.headshot_deleted = True
                        job.headshot_url = ""  
                        session.add(job)
                        session.commit()
                        logger.info(f"Successfully cleaned up headshot for job {job.id}")
                    except Exception as e:
                        logger.error(f"Failed to delete headshot for job {job.id}: {e}")

                        #delete anyway to prevent retrying on every loop and filling up logs with errors
                        job.headshot_deleted = True
                        session.add(job)
                        session.commit()
                        
        except Exception as e:
            logger.error(f"Error in cleanup loop: {e}")
            
        #check every 1 hour
        await asyncio.sleep(3600)