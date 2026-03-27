CREATE TABLE IF NOT EXISTS t_p63769834_self_service_cafe_or.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  price INTEGER NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT DEFAULT '',
  available BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p63769834_self_service_cafe_or.orders (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'new',
  total INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p63769834_self_service_cafe_or.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES t_p63769834_self_service_cafe_or.orders(id),
  item_id TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_emoji TEXT DEFAULT '',
  item_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1
);
