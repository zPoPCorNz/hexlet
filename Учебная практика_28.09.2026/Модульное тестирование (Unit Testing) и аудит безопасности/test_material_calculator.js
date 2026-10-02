const test = require('node:test');
const assert = require('node:assert/strict');
const { calculateRequiredMaterial } = require('./materialCalculator');

test('Набор Unit-тестов для ядра алгоритма расчета сырья и материалов', async (t) => {

  // Тест 1 (Стандартный): Проверка обычного корректного расчета с известным результатом
  await t.test('Тест 1 (Стандартный): базовый расчет для известных параметров', async () => {

    const result = await calculateRequiredMaterial(1, 1, 10, 1.5, 2.0);
    assert.equal(result, 37, 'Стандартный расчет должен возвращать ровно 37 ед.');
  });

  // Тест 2 (Округление): Проверка, что дробный результат округляется строго в большую сторону (ceil)
  await t.test('Тест 2 (Округление): строгое округление дробного остатка вверх', async () => {
    const result = await calculateRequiredMaterial(2, 2, 7, 1.0, 1.0);
    assert.equal(result, 11, 'Дробный результат 10.542 должен быть округлен строго вверх до 11');
  });

  // Тест 3 (Несуществующий тип): Проверка возврата -1 при передаче некорректных ID
  await t.test('Тест 3 (Несуществующий тип): возврат -1 при несуществующих ID типов продукции или сырья', async () => {
    const invalidProductType = await calculateRequiredMaterial(9999, 1, 10, 1.5, 2.0);
    assert.equal(invalidProductType, -1, 'При несуществующем ID типа продукции метод обязан вернуть -1');

    const invalidMaterialType = await calculateRequiredMaterial(1, 8888, 10, 1.5, 2.0);
    assert.equal(invalidMaterialType, -1, 'При несуществующем ID типа материала метод обязан вернуть -1');
  });

  // Тест 4 (Отрицательные параметры): Проверка возврата -1 при отрицательных размерах
  await t.test('Тест 4 (Отрицательные параметры): возврат -1 при отрицательных param_1 или param_2', async () => {
    const negativeParam1 = await calculateRequiredMaterial(1, 1, 10, -1.5, 2.0);
    assert.equal(negativeParam1, -1, 'При param_1 <= 0 метод обязан вернуть -1');

    const negativeParam2 = await calculateRequiredMaterial(1, 1, 10, 1.5, -2.0);
    assert.equal(negativeParam2, -1, 'При param_2 <= 0 метод обязан вернуть -1');
  });

  // Тест 5 (Нулевое количество): Проверка возврата -1 при quantity <= 0
  await t.test('Тест 5 (Нулевое количество): возврат -1 при количестве продукции равном 0 или меньше', async () => {
    const zeroQuantity = await calculateRequiredMaterial(1, 1, 0, 1.5, 2.0);
    assert.equal(zeroQuantity, -1, 'При quantity = 0 метод обязан вернуть -1');

    const negativeQuantity = await calculateRequiredMaterial(1, 1, -15, 1.5, 2.0);
    assert.equal(negativeQuantity, -1, 'При quantity < 0 метод обязан вернуть -1');
  });

});