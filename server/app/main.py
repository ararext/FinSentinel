from fastapi import FastAPI
from app.routes import router
from app.db import db

app = FastAPI(title="Fraud Detection Backend")

@app.on_event("startup")
async def startup():
    await db.connect()

@app.on_event("shutdown")
async def shutdown():
    await db.disconnect()

app.include_router(router)
