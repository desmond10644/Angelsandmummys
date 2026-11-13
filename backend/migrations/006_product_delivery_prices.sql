ALTER TABLE products
ADD COLUMN IF NOT EXISTS delivery_price INTEGER NOT NULL DEFAULT 0
CHECK (delivery_price >= 0);

ALTER TABLE order_items
ADD COLUMN IF NOT EXISTS delivery_price INTEGER NOT NULL DEFAULT 0
CHECK (delivery_price >= 0);
