DROP TABLE IF EXISTS sales_history;
DROP TABLE IF EXISTS partners;

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

CREATE TABLE sales_history (
    id SERIAL PRIMARY KEY,
    partner_id INT NOT NULL REFERENCES partners(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity >= 0)
);

INSERT INTO partners (type, name, director, phone, rating, address, email) VALUES 
  ('ЗАО', 'База Строитель', 'Иванов Иван Иванович', '+7 223 322 22 32', 10, 'г. Москва, ул. Ленина, д. 10', 'baza@mail.ru'),
  ('ООО', 'Паркет 29', 'Петров Петр Петрович', '+7 912 345 67 89', 8, 'г. Архангельск, пр. Ломоносова, 29', 'parket29@yandex.ru'),
  ('ПАО', 'СтройКомплект', 'Сидоров Алексей Николаевич', '+7 495 111 22 33', 10, 'г. Казань, ул. Баумана, 5', 'stroy@gmail.com'),
  ('ИП', 'Новый Партнер (Без Продаж)', 'Кузнецов Сергей Васильевич', '+7 999 000 11 22', 5, 'г. Самара, ул. Мира, 1', 'ip_kuznetsov@mail.ru');

INSERT INTO sales_history (partner_id, quantity) VALUES 
  (1, 50000), 
  (2, 10000), 
  (2, 5000), 
  (3, 200000), 
  (3, 120000);