const { calculateRequiredMaterial } = require('./materialCalculator');

async function runTests() {
  console.log('--- Старт тестирования ядра алгоритма расчета материалов ---\n');

  let passed = 0;
  let failed = 0;

  function assertEqual(testName, actual, expected) {
    if (actual === expected) {
      console.log(`[PASS] ${testName}: результат = ${actual}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName}: ожидалось ${expected}, получено ${actual}`);
      failed++;
    }
  }

  const res1 = await calculateRequiredMaterial(1, 1, 10, 1.5, 2.0);
  assertEqual('Корректный расчет с округлением ceil', res1, 37);

  const res2 = await calculateRequiredMaterial(1, 1, -5, 1.5, 2.0);
  assertEqual('Отрицательное количество продукции', res2, -1);

  const res3 = await calculateRequiredMaterial(1, 1, 0, 1.5, 2.0);
  assertEqual('Нулевое количество продукции', res3, -1);

  const res4 = await calculateRequiredMaterial(1, 1, 10, -1.5, 2.0);
  assertEqual('Отрицательный параметр param_1', res4, -1);

  const res5 = await calculateRequiredMaterial(999, 1, 10, 1.5, 2.0);
  assertEqual('Несуществующий ID типа продукции', res5, -1);

  const res6 = await calculateRequiredMaterial(1, 999, 10, 1.5, 2.0);
  assertEqual('Несуществующий ID типа материала', res6, -1);

  const res7 = await calculateRequiredMaterial(1, 1, 'десять', 1.5, 2.0);
  assertEqual('Строковый аргумент вместо числа', res7, -1);

  console.log(`\nИтоги тестов: Успешно: ${passed} | Ошибок: ${failed}`);
}

runTests();