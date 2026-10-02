const { calculateRequiredMaterial } = require('./materialCalculator');

async function runComprehensiveTests() {
  console.log('--- Комплексное тестирование устойчивости метода расчета сырья ---\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testDescription) {
    if (condition) {
      console.log(`[OK] ${testDescription}`);
      passed += 1;
    } else {
      console.error(`[FAIL] ${testDescription}`);
      failed += 1;
    }
  }

  // 1. Позитивный сценарий: расчет корректных параметров
  const validResult = await calculateRequiredMaterial(1, 1, 10, 1.5, 2.0);
  assert(validResult === 37, 'Позитивный расчет: корректное значение 37 ед.');

  // 2. Стресс-тест: отрицательный размер изделия
  const negativeParamResult = await calculateRequiredMaterial(1, 1, 10, -5.0, 2.0);
  assert(negativeParamResult === -1, 'Отрицательный размер param1: возврат -1 без падения программы');

  // 3. Стресс-тест: нулевой размер изделия
  const zeroParamResult = await calculateRequiredMaterial(1, 1, 10, 0, 2.0);
  assert(zeroParamResult === -1, 'Нулевой размер param1: возврат -1');

  // 4. Стресс-тест: несуществующий ID типа продукции
  const unknownProductTypeResult = await calculateRequiredMaterial(9999, 1, 10, 1.5, 2.0);
  assert(unknownProductTypeResult === -1, 'Несуществующий ID типа продукции: возврат -1');

  // 5. Стресс-тест: несуществующий ID типа материала
  const unknownMaterialTypeResult = await calculateRequiredMaterial(1, 8888, 10, 1.5, 2.0);
  assert(unknownMaterialTypeResult === -1, 'Несуществующий ID типа материала: возврат -1');

  // 6. Стресс-тест: передача нечисловых аргументов
  const invalidTypeResult = await calculateRequiredMaterial('ламинат', 1, 10, 1.5, 2.0);
  assert(invalidTypeResult === -1, 'Строковый аргумент вместо числового ID: возврат -1');

  console.log(`\nИтоги комплексного тестирования: Пройдено: ${passed} из ${passed + failed}`);
}

runComprehensiveTests();