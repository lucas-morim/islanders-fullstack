from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, DateTime, func
import uuid, datetime as dt

def uuid4_str() -> str:
    return str(uuid.uuid4())

class IdMixin:
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=uuid4_str)

class TimestampMixin:
    created_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[dt.datetime] = mapped_column(
        DateTime(timezone=True), onupdate=func.now(), server_default=func.now(), nullable=False
    )