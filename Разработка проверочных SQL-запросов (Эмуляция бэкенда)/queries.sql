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
-- 2. Запрос для добавления/обновления данных
begin;
insert into partners (name, inn, email, phone, rating)
	VALUES (
	    'ООО "Бутафория"', 
	    '775464671', 
	    'butaforia@gmail.com', 
	    '+7 (911) 911-99-11', 
	    2.0
	);
insert into sales (partner_id, product_id, quantity, sale_date)
	values (
	4,
	1,25,
	current_date
	);
commit;
-- 3. Запрос для истории реализации
select
	s.id as sale_id,
	pr.name as product_name,
	s.sale_date,
	s.quantity,
	pr.price as unit_price,
	(s.quantity * pr.price) as total_amount
from sales s
join products pr on s.product_id = pr.id
where s.partner_id = 1
  and s.sale_date between '2026-03-01' and '2026-03-31'
order by s.sale_date desc, s.id desc;