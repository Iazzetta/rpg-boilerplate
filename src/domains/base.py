from pydantic import BaseModel
from datetime import datetime

class BaseDomain(BaseModel):
    id: str
    created_at: datetime
