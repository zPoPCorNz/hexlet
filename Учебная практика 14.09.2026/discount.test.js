const { calculatePartnerDiscount } = require('./discount');
// Тесты значений
function runTests() {
    const testCases = [
        { input: 0, expected: 0 },
        { input: 9999, expected: 0 },
        { input: 10000, expected: 5 },
        { input: 49999, expected: 5 },
        { input: 50000, expected: 10 },
        { input: 299999, expected: 10 },
        { input: 300000, expected: 15 },
        { input: 1000000, expected: 15 },
    ];

let passedCount = 0;
let totalCount = testCases.length;

  // 1. Прогон табличных тестов
  for (const test of testCases) {
    const actual = calculatePartnerDiscount(test.input);
    const isPassed = actual === test.expected;

    if (isPassed) {
      passedCount += 1;
      console.log(`Ожидалось: ${test.expected}%, Получено: ${actual}%`);
    } else {
      console.error(`Ожидалось: ${test.expected}%, Получено: ${actual}%`);
    }
  }
// Тесты ошибок
try {
    calculatePartnerDiscount(-1);
    console.error('Ошибка не выброшена');
} catch (error) {
    passedCount += 1;
    console.log('Ошибка успешно отработана')
}

console.log(`\n Итог: пройдено ${passedCount} из ${testCases.length + 1} тестов.`);
}

runTests();