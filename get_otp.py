# api/get_otp.py
import os, json
from http.server import BaseHTTPRequestHandler

def handler(request):
    qs = request.query.get("request_id")
    if not qs:
        return {"status":400, "body": {"error":"request_id required"}}
    request_id = qs

    import psycopg2
    DATABASE_URL = os.environ.get("DATABASE_URL")
    conn = psycopg2.connect(DATABASE_URL, sslmode='require')
    cur = conn.cursor()
    cur.execute("SELECT otp, created_at FROM otps WHERE request_id = %s LIMIT 1", (request_id,))
    row = cur.fetchone()
    cur.close()
    conn.close()
    if not row:
        return {"status":204, "body": ""}   # no content yet
    otp, created_at = row
    return {"status":200, "body": {"otp": otp, "created_at": created_at.isoformat()}}
