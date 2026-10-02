DROP TABLE IF EXISTS material_types CASCADE;
DROP TABLE IF EXISTS product_types CASCADE;

-- Справочник типов продукции с коэффициентами
CREATE TABLE product_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coefficient NUMERIC(6, 2) NOT NULL CHECK (coefficient > 0)
);

-- Справочник типов материалов с процентом брака
CREATE TABLE material_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    defect_rate NUMERIC(6, 4) NOT NULL CHECK (defect_rate >= 0)
);

-- Тестовые эталонные данные справочников
INSERT INTO product_types (id, name, coefficient) VALUES
  (1, 'Ламинат', 1.20),
  (2, 'Массивная доска', 1.50),
  (3, 'Паркетная доска', 2.10);

INSERT INTO material_types (id, name, defect_rate) VALUES
  (1, 'Древесина дуба', 0.25),   -- 0.25% брака
  (2, 'Древесина сосны', 0.40),  -- 0.40% брака
  (3, 'Полимерный клей', 0.15);  -- 0.15% брака