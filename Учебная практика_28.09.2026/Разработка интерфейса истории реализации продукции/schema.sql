DROP TABLE IF EXISTS sales_history CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS partners CASCADE;

CREATE TABLE partners (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    director VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    rating INT NOT NULL DEFAULT 0,
    address VARCHAR(255),
    email VARCHAR(255)
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    min_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00
);

CREATE TABLE sales_history (
    id SERIAL PRIMARY KEY,
    partner_id INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity >= 0),
    sale_date DATE NOT NULL DEFAULT CURRENT_DATE
);

INSERT INTO partners (type, name, director, phone, rating, address, email) VALUES 
  ('ЗАО', 'База Строитель', 'Иванов Иван Иванович', '+7 223 322 22 32', 10, 'г. Москва, ул. Ленина, д. 10', 'baza@mail.ru'),
  ('ООО', 'Паркет 29', 'Петров Петр Петрович', '+7 912 345 67 89', 8, 'г. Архангельск, пр. Ломоносова, 29', 'parket29@yandex.ru'),
  ('ПАО', 'СтройКомплект', 'Сидоров Алексей Николаевич', '+7 495 111 22 33', 10, 'г. Казань, ул. Баумана, 5', 'stroy@gmail.com'),
  ('ИП', 'ЛесПром', 'Кузнецов Сергей Васильевич', '+7 999 000 11 22', 5, 'г. Самара, ул. Мира, 1', 'ip_kuznetsov@mail.ru');

INSERT INTO products (name, min_cost) VALUES
  ('Паркетная доска Дуб Классик', 2450.00),
  ('Ламинат 33 класс Серый Ясень', 1120.00),
  ('Клей паркетный двухкомпонентный 10 кг', 4300.00),
  ('Плинтус шпонированный 60мм', 350.00),
  ('Подложка пробковая 3мм (рулон 10м)', 1890.00);

INSERT INTO sales_history (partner_id, product_id, quantity, sale_date) VALUES 
  (1, 1, 15000, '2026-03-12'),
  (1, 3, 5000,  '2026-04-18'),
  (1, 5, 30000, '2026-07-22'),
  (2, 2, 7500,  '2026-05-10'),
  (2, 4, 7500,  '2026-08-14'),
  (3, 1, 120000,'2026-01-20'),
  (3, 2, 200000,'2026-06-15');
