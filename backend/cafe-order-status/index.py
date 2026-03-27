"""Получение и обновление статуса конкретного заказа"""
import json
import os
import psycopg2

SCHEMA = "t_p63769834_self_service_cafe_or"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

VALID_STATUSES = ("new", "cooking", "ready", "done")


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    conn = get_conn()
    cur = conn.cursor()

    if method == "GET":
        order_id = params.get("id")
        code = params.get("code")

        if code:
            cur.execute(
                f"SELECT id, code, status, total, created_at FROM {SCHEMA}.orders WHERE code=%s",
                (code,)
            )
        elif order_id:
            cur.execute(
                f"SELECT id, code, status, total, created_at FROM {SCHEMA}.orders WHERE id=%s",
                (order_id,)
            )
        else:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Need id or code"})}

        row = cur.fetchone()
        if not row:
            cur.close(); conn.close()
            return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "Order not found"})}

        oid = row[0]
        cur.execute(
            f"SELECT item_id, item_name, item_emoji, item_price, quantity FROM {SCHEMA}.order_items WHERE order_id=%s",
            (oid,)
        )
        items = [
            {"item": {"id": r[0], "name": r[1], "emoji": r[2], "price": r[3], "category": "", "description": "", "available": True}, "quantity": r[4]}
            for r in cur.fetchall()
        ]

        order = {
            "id": str(oid),
            "code": row[1],
            "status": row[2],
            "total": row[3],
            "createdAt": row[4].isoformat(),
            "items": items
        }
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"order": order})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        order_id = body.get("id")
        new_status = body.get("status")

        if new_status not in VALID_STATUSES:
            cur.close(); conn.close()
            return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "Invalid status"})}

        cur.execute(
            f"UPDATE {SCHEMA}.orders SET status=%s, updated_at=NOW() WHERE id=%s",
            (new_status, order_id)
        )
        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    cur.close(); conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
