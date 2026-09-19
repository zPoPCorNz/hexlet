CREATE TABLE IF NOT EXISTS partners (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS sales_history (
    id SERIAL PRIMARY KEY,
    partner_id INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity >= 0)
);

INSERT INTO partners (name) VALUES 
  ('Партнер Без Продаж'),
  ('Малый Партнер'),
  ('Крупный Партнер');

INSERT INTO sales_history (partner_id, quantity) VALUES (2, 5000), (2, 10000), (3, 200000), (3, 120000);
