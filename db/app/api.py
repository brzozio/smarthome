from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from db import SessionLocal, Climate, init_db

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

init_db()

class ClimateIn(BaseModel):
    temperature: float
    humidity:    float

@app.post("/api/v1/climate")
def create_temperature(data: ClimateIn):
    db = SessionLocal()
    try:
        record: Climate = Climate(
            temperature=data.temperature,
            humidity=data.humidity
        )
        db.add(record)
        db.commit()
        db.refresh(record)

        return {
            "status": "ok",
            "id": record.id,
            "temperature": record.temperature,
            "humidity": record.humidity,
            "created_at": record.created_at,
        }

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        db.close()


@app.get("/api/v1/climate")
def get_temperatures(limit: int = 10):
    db = SessionLocal()
    try:
        records = (
            db.query(Climate)
            .order_by(Climate.id.desc())
            .limit(limit)
            .all()
        )

        return [
            {
                "id": r.id,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "created_at": r.created_at,
            }
            for r in records
        ]
    finally:
        db.close()

@app.get("/api/v1/climateAll")
def get_temperatures():
    db = SessionLocal()
    try:
        records = (
            db.query(Climate)
            .order_by(Climate.id.desc())
            .all()
        )

        return [
            {
                "id": r.id,
                "temperature": r.temperature,
                "humidity": r.humidity,
                "created_at": r.created_at,
            }
            for r in records
        ]
    finally:
        db.close()