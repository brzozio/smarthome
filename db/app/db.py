from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime
import pendulum

local_tz = pendulum.timezone('Europe/Warsaw')

DATABASE_URL: str = "sqlite:////data/climate.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

class Climate(Base):
    __tablename__ = "climate"

    id           = Column(Integer, primary_key=True, index=True)
    temperature  = Column(Float, nullable=False)
    humidity     = Column(Float, nullable=False)
    created_at   = Column(DateTime, default=lambda: datetime.now(tz=local_tz))

def init_db():
    Base.metadata.create_all(bind=engine)