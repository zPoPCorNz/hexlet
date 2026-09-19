-- 1. Запрос для вывода списка партнёров
SELECT 
    p.id AS partner_id,
    p.name AS partner_name,
    p.inn,
    p.email,
    p.phone,
    p.rating,
    COUNT(s.id) AS total_sales_count
FROM partners p
LEFT JOIN sales s ON p.id = s.partner_id
GROUP BY p.id, p.name, p.inn, p.email, p.phone, p.rating
ORDER BY p.name ASC;
-- 2. Запрос для добавления/обновления данных (исправленный)
BEGIN;
INSERT INTO partners (name, inn, email, phone, rating)
VALUES (
    'ООО "Бутафория"', 
    '7754646710', 
    'butaforia@gmail.com', 
    '+7 (911) 911-99-11', 
    2.0
);
INSERT INTO sales (partner_id, product_id, quantity, sale_date)
VALUES (
    (SELECT id FROM partners WHERE inn = '7754646710'),
    (SELECT id FROM products WHERE name = 'Стиральный порошок "Альфа"'),
    25,
    CURRENT_DATE
);
COMMIT;
-- 3. Запрос для истории реализации  (исправленный)
SELECT
    s.id AS sale_id,
    pr.name AS product_name,
    s.sale_date,
    s.quantity,
    pr.price AS unit_price,
    (s.quantity * pr.price) AS total_amount
FROM sales s
JOIN products pr ON s.product_id = pr.id
WHERE s.partner_id = (SELECT id FROM partners WHERE inn = '7701234567')
  AND s.sale_date BETWEEN '2026-03-01' AND '2026-03-31'
ORDER BY s.sale_date DESC, s.id DESC;
