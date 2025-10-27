from fastapi import FastAPI, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional, List
import asyncpg
import os

app = FastAPI(title="OTP Partner Server")

DATABASE_URL = os.getenv("DATABASE_URL")  # URL دیتابیس Neon

# ----------- اتصال به دیتابیس -----------
async def get_db():
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# ----------- مدل‌های داده‌ای -----------
class CustomerIn(BaseModel):
    name: Optional[str]
    phone: str
    device_id: Optional[str]
    app_version: Optional[str]

class MessageIn(BaseModel):
    sender: str
    body: str
    customer_phone: str

# ----------- مسیر 1: ثبت مشتری -----------
@app.post("/api/customers/register")
async def register_customer(
    data: CustomerIn,
    x_api_key: str = Header(...),
    db=Depends(get_db)
):
    # بررسی همکار معتبر
    agent = await db.fetchrow("SELECT id FROM agents WHERE api_key=$1", x_api_key)
    if not agent:
        raise HTTPException(status_code=401, detail="کلید API نامعتبر است")

    # ثبت یا بروزرسانی مشتری
    customer = await db.fetchrow("""
        INSERT INTO customers (agent_id, name, phone, device_id, app_version)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (phone)
        DO UPDATE SET
            name=EXCLUDED.name,
            device_id=EXCLUDED.device_id,
            app_version=EXCLUDED.app_version
        RETURNING id
    """, agent["id"], data.name, data.phone, data.device_id, data.app_version)

    return {"status": "ok", "customer_id": customer["id"]}

# ----------- مسیر 2: ثبت پیامک جدید -----------
@app.post("/api/messages/receive")
async def receive_message(
    msg: MessageIn,
    x_api_key: str = Header(...),
    db=Depends(get_db)
):
    # بررسی همکار معتبر
    agent = await db.fetchrow("SELECT id FROM agents WHERE api_key=$1", x_api_key)
    if not agent:
        raise HTTPException(status_code=401, detail="کلید API نامعتبر است")

    # یافتن مشتری بر اساس شماره
    customer = await db.fetchrow(
        "SELECT id FROM customers WHERE phone=$1 AND agent_id=$2",
        msg.customer_phone, agent["id"]
    )
    if not customer:
        raise HTTPException(status_code=404, detail="مشتری یافت نشد")

    # درج پیامک
    await db.execute("""
        INSERT INTO messages (customer_id, sender, body)
        VALUES ($1, $2, $3)
    """, customer["id"], msg.sender, msg.body)

    return {"status": "stored"}
