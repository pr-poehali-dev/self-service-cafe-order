"""Получение и управление меню кафе"""
import json
import os
import psycopg2

SCHEMA = "t_p63769834_self_service_cafe_or"

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-Kitchen-Token",
}

DEFAULT_MENU = [
    ("1","Капучино","Эспрессо с молочной пенкой",280,"Напитки","☕",True),
    ("2","Латте","Нежный кофе с молоком",320,"Напитки","🥛",True),
    ("3","Апельсиновый сок","Свежевыжатый",250,"Напитки","🍊",True),
    ("4","Чай с мятой","Травяной, успокаивающий",180,"Напитки","🍵",True),
    ("5","Авокадо-тост","На хлебе из закваски, рикотта, яйцо пашот",490,"Завтраки","🥑",True),
    ("6","Овсяная каша","С ягодами и мёдом",310,"Завтраки","🥣",True),
    ("7","Яйца бенедикт","С лососем и голландским соусом",580,"Завтраки","🍳",True),
    ("8","Бургер классик","Говяжья котлета, чеддер, салат, томат",650,"Основное","🍔",True),
    ("9","Паста Карбонара","Бекон, яйцо, пармезан",590,"Основное","🍝",True),
    ("10","Цезарь с курицей","Салат, курица, пармезан, гренки",480,"Салаты","🥗",True),
    ("11","Греческий салат","Овощи, фета, маслины",420,"Салаты","🫙",True),
    ("12","Чизкейк","Нью-Йорк стайл, ягодный соус",380,"Десерты","🍰",True),
    ("13","Тирамису","Классический итальянский",360,"Десерты","🍮",True),
    ("14","Брауни","Шоколадный, с мороженым",320,"Десерты","🍫",True),
]


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def ensure_menu(cur):
    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.menu_items")
    count = cur.fetchone()[0]
    if count == 0:
        for row in DEFAULT_MENU:
            cur.execute(
                f"INSERT INTO {SCHEMA}.menu_items (id,name,description,price,category,emoji,available) VALUES (%s,%s,%s,%s,%s,%s,%s) ON CONFLICT DO NOTHING",
                row
            )


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    conn = get_conn()
    cur = conn.cursor()

    if method == "GET":
        ensure_menu(cur)
        conn.commit()
        cur.execute(f"SELECT id,name,description,price,category,emoji,available FROM {SCHEMA}.menu_items ORDER BY category,name")
        rows = cur.fetchall()
        items = [
            {"id": r[0], "name": r[1], "description": r[2], "price": r[3],
             "category": r[4], "emoji": r[5], "available": r[6]}
            for r in rows
        ]
        cur.close(); conn.close()
        return {"statusCode": 200, "headers": CORS, "body": json.dumps({"items": items})}

    if method == "POST":
        body = json.loads(event.get("body") or "{}")
        action = body.get("action")

        if action == "upsert":
            item = body["item"]
            cur.execute(
                f"""INSERT INTO {SCHEMA}.menu_items (id,name,description,price,category,emoji,available)
                    VALUES (%s,%s,%s,%s,%s,%s,%s)
                    ON CONFLICT (id) DO UPDATE SET
                      name=EXCLUDED.name, description=EXCLUDED.description,
                      price=EXCLUDED.price, category=EXCLUDED.category,
                      emoji=EXCLUDED.emoji, available=EXCLUDED.available""",
                (item["id"], item["name"], item.get("description",""),
                 item["price"], item["category"], item.get("emoji","🍽"),
                 item.get("available", True))
            )
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        if action == "toggle":
            cur.execute(
                f"UPDATE {SCHEMA}.menu_items SET available = NOT available WHERE id=%s",
                (body["id"],)
            )
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

        if action == "delete":
            cur.execute(f"UPDATE {SCHEMA}.menu_items SET available=FALSE WHERE id=%s", (body["id"],))
            conn.commit()
            cur.close(); conn.close()
            return {"statusCode": 200, "headers": CORS, "body": json.dumps({"ok": True})}

    cur.close(); conn.close()
    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "Method not allowed"})}
