"""The python service of the saasx lab: stock reports kept in postgresql and object storage."""

import json
import os
import uuid
from contextlib import asynccontextmanager
from datetime import UTC, datetime
from pathlib import Path

import boto3
import httpx
from botocore.exceptions import ClientError
from fastapi import FastAPI, HTTPException
from psycopg_pool import AsyncConnectionPool
from starlette.concurrency import run_in_threadpool

SCHEMA = """
CREATE TABLE IF NOT EXISTS reports (
    id         UUID        PRIMARY KEY,
    items      INTEGER     NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
)
"""

NODE_URL = os.environ.get("SERVICE_NODE_URL", "")
BUCKET = os.environ.get("STORAGE_BUCKET", "")
ROOT = Path(os.environ.get("STORAGE_PATH") or "/data")

pool = AsyncConnectionPool(os.environ.get("DATABASE_URL", ""), open=False, min_size=1, max_size=5)
client = httpx.AsyncClient(timeout=5)
s3 = (
    boto3.client("s3", region_name=os.environ.get("STORAGE_REGION") or None, endpoint_url=os.environ.get("STORAGE_ENDPOINT") or None)
    if BUCKET
    else None
)


@asynccontextmanager
async def lifespan(_: FastAPI):
    await pool.open(wait=True, timeout=60)

    async with pool.connection() as conn:
        await conn.execute(SCHEMA)

    yield

    await client.aclose()
    await pool.close()


app = FastAPI(title="saasx-python", lifespan=lifespan)


async def call(url: str) -> dict:
    try:
        return (await client.get(url)).json()
    except (httpx.HTTPError, ValueError) as error:
        return {"error": str(error) or type(error).__name__}


def put(key: str, body: str) -> None:
    if s3:
        s3.put_object(Bucket=BUCKET, Key=key, Body=body.encode(), ContentType="application/json")
        return

    path = ROOT / key
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(body)


def get(key: str) -> str:
    if s3:
        try:
            return s3.get_object(Bucket=BUCKET, Key=key)["Body"].read().decode()
        except ClientError as error:
            if error.response.get("Error", {}).get("Code") in ("NoSuchKey", "404"):
                raise FileNotFoundError(key) from error
            raise

    return (ROOT / key).read_text()


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.get("/mesh")
async def mesh() -> dict:
    return {"service": "python", "runtime": "python", "calls": {"node": await call(f"{NODE_URL}/mesh")}}


@app.post("/reports", status_code=201)
async def create_report() -> dict:
    stock = await call(f"{NODE_URL}/stock")
    report = uuid.uuid4()
    items = int(stock.get("count", 0)) if "error" not in stock else 0

    await run_in_threadpool(put, f"reports/{report}.json", json.dumps({"id": str(report), "created_at": datetime.now(UTC).isoformat(), "stock": stock}))

    async with pool.connection() as conn:
        await conn.execute("INSERT INTO reports (id, items) VALUES (%s, %s)", (report, items))

    return {"id": str(report), "items": items, "stored": "bucket" if s3 else "volume"}


@app.get("/reports")
async def list_reports() -> dict:
    async with pool.connection() as conn:
        rows = await (await conn.execute("SELECT id, items, created_at FROM reports ORDER BY created_at DESC LIMIT 100")).fetchall()

    return {"reports": [{"id": str(id_), "items": items, "created_at": at.isoformat()} for id_, items, at in rows], "count": len(rows)}


@app.get("/reports/{report}")
async def show_report(report: uuid.UUID) -> dict:
    try:
        return json.loads(await run_in_threadpool(get, f"reports/{report}.json"))
    except FileNotFoundError as error:
        raise HTTPException(404, "no such report") from error
