from datetime import datetime , timezone
from typing import Optional, List
from uuid import uuid4

from sqlmodel import Field , SQLModel, Relationship

def _uuid() -> str:
    return str(uuid4())

def _now() -> datetime:
    return datetime.now(timezone.utc) 

class Avatar(SQLModel, table=True):
    id: str = Field(default_factory= _uuid, primary_key=True)
    job_id: str = Field(foreign_key="job.id")
    style_name: str = Field(default="")
    imagekit_url: Optional[str] = Field(default=None)
    status: str = Field(default="pending")
    error_message: Optional[str] = Field(default=None)
    created_at: datetime = Field(default_factory=_now)

    job: Optional["Job"] = Relationship(back_populates="avatars") 

class Job(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(default="" , index=True) 
    prompt: str = Field(default="")
    num_avatars: int = Field(default=1)
    headshot_url: str = Field(default="")
    headshot_file_id: Optional[str] = Field(default=None)
    headshot_deleted: bool = Field(default=False)
    status: str = Field(default="pending")
    created_at: datetime = Field(default_factory=_now)

    avatars: List[Avatar] = Relationship(back_populates="job")
