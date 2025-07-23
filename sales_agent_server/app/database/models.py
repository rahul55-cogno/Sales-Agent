from sqlalchemy import Column, Integer, String,DateTime, ForeignKey, Boolean
from database.session import Base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.orm import Session
from typing import List

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    refresh_token = Column(String, nullable=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    chatsessions = relationship("ChatSession", back_populates="user", cascade="all, delete-orphan")

    @classmethod
    def get_by_email(cls, db: Session, email: str):
        return db.query(cls).filter(cls.email == email).first()

class ChatSession(Base):
    __tablename__ = "chatsessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="chatsessions")
    chats = relationship("Chats", back_populates="chatsession", cascade="all, delete-orphan")

    @classmethod
    def get_session(cls, db: Session, session_id: str,user_id:str):
        return db.query(cls).filter(cls.id == session_id,cls.user_id==user_id).first()

    @classmethod
    def create_session(cls, db: Session, user_id: int):
        new_session = cls(user_id=user_id)
        db.add(new_session)
        db.commit()
        db.refresh(new_session)
        return new_session

from datetime import datetime
class Chats(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    to_show=Column(Boolean,default=False)
    for_context=Column(Boolean,default=False)

    chatsession_id = Column(Integer, ForeignKey("chatsessions.id"), nullable=False)

    chatsession = relationship("ChatSession", back_populates="chats")

    @classmethod
    def create_chat(cls, db: Session, type: str, content: str, chatsession_id: int,to_show:bool,for_context:bool):
        new_chat = cls(
            type=type,
            content=content,
            chatsession_id=chatsession_id,
            timestamp=datetime.utcnow(),
            to_show=to_show,
            for_context=for_context
        )
        db.add(new_chat)
        db.commit()
        db.refresh(new_chat)
        return new_chat

    @classmethod
    def get_chats_by_session(cls, db: Session, chatsession_id: int) -> List["Chats"]:
        return (
            db.query(cls)
            .filter(cls.chatsession_id == chatsession_id,cls.to_show==True)
            .order_by(cls.timestamp.asc())
            .all()
        )
    @classmethod
    def get_last_n_chats(cls, db: Session, chatsession_id: int, n: int = 5) -> List["Chats"]:
        """
        Return the last n chats of a given session, ordered by timestamp descending.
        """
        return (
            db.query(cls)
            .filter(cls.chatsession_id == chatsession_id, cls.for_context == True)
            .order_by(cls.timestamp.desc())
            .limit(n)
            .all()
        )