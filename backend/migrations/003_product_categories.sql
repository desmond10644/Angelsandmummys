CREATE TABLE IF NOT EXISTS product_categories (
  name TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO product_categories (name)
SELECT DISTINCT category
FROM products
WHERE BTRIM(category) <> ''
ON CONFLICT (name) DO NOTHING;
