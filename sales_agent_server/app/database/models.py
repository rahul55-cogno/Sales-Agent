from sqlalchemy import Column, Integer, String
from database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    refresh_token = Column(String, nullable=True)
    name = Column(String, nullable=True)
    picture = Column(String, nullable=True)
