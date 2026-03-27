"""Создание заказов и получение списка заказов для кухни"""
import json
import os
import random
import string
import psycopg2

SCHEMA = "t_p63769834_self_service_cafe_or"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def gen_code():
    return "".join(random.choices(string.digits, k=4))


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    conn = get_conn()
    cur = conn.cursor()

    if method == "GET":
        cur.execute(
            f"""SELECT o.id, o.code, o.status, o.total, o.created_at,
                       oi.item_id, oi.item_name, oi.item_emoji, oi.item_price, oi.quantity
                FROM {SCHEMA}.orders o
                JOIN {SCHEMA}.order_items oi ON oi.order_id = o.id
                WHERE o.created_at > NOW() - INTERVAL '12 hours'
                ORDER BY o.created_at DESC"""
        )
        rows = cur.fetchall()
        orders_map = {}
        for r in rows:
            oid = r[0]
            if oid not in orders_map:
                orders_map[oid] = {
                    "id": str(oid),
                    "code": r[1],
                    "status": r[2],
                    "total": r[3],
                    "createdAt": r[4].isoformat(),
                    "items": []
                }
            orders_map[oid]["items"].append({
                "item": {
                    "id": r[5], "name": r[6], "emoji": r[7],
                    "price": r[8], "category": "", "description": "", "available": True
                },
                "quantity": r[9]
            })
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"orders": list(orders_map.values())})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        items = body.get("items", [])
        total = body.get("total", 0)

        code = gen_code()
        for _ in range(10):
            cur.execute(f"SELECT 1 FROM {SCHEMA}.orders WHERE code=%s", (code,))
            if not cur.fetchone():
                break
            code = gen_code()

        cur.execute(
            f"INSERT INTO {SCHEMA}.orders (code, status, total) VALUES (%s, 'new', %s) RETURNING id",
            (code, total)
        )
        order_id = cur.fetchone()[0]

        for ci in items:
            item = ci["item"]
            cur.execute(
                f"INSERT INTO {SCHEMA}.order_items (order_id, item_id, item_name, item_emoji, item_price, quantity) VALUES (%s,%s,%s,%s,%s,%s)",
                (order_id, item["id"], item["name"], item.get("emoji",""), item["price"], ci["quantity"])
            )

        conn.commit()
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"id": str(order_id), "code": code})}

    cur.close(); conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
