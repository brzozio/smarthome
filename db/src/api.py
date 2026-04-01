from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime

from sqlalchemy import create_engine, Column, Integer, Float, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base

# ==== DB SETUP ====

DATABASE_URL = "sqlite:///./temperature.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ==== MODEL ====

class Temperature(Base):
    __tablename__ = "temperature"

    id = Column(Integer, primary_key=True, index=True)
    value = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# create table
Base.metadata.create_all(bind=engine)

# ==== FASTAPI ====

app = FastAPI()

class TempIn(BaseModel):
    temp: float


@app.post("/api/v1/temperature")
def create_temperature(data: TempIn):
    db = SessionLocal()
    try:
        record = Temperature(value=data.temp)
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "status": "ok",
            "id": record.id,
            "temp": record.value,
            "created_at": record.created_at,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        db.close()


@app.get("/api/v1/temperature")
def get_temperatures(limit: int = 10):
    db = SessionLocal()
    try:
        records = (
            db.query(Temperature)
            .order_by(Temperature.created_at.desc())
            .limit(limit)
            .all()
        )

        return records

    finally:
        db.close()