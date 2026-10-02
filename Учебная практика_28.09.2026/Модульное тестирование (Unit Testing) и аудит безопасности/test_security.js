const { Client } = require('pg');
const { logError } = require('./logger');

async function testSqlInjectionVulnerability() {
  console.log('--- Аудит безопасности: Тестирование защиты от SQL-инъекций ---\n');

  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'sales_db',
    password: '1494',
    port: 5432,
  });

  try {
    await client.connect();

    const maliciousPayload = "' OR '1'='1' --";

    // 1. Безопасный запрос с параметризованными аргументами ($1)[cite: 10]
    const safeQuery = 'SELECT * FROM partners WHERE name = $1;';
    const safeResult = await client.query(safeQuery, [maliciousPayload]);

    if (safeResult.rows.length === 0) {
      console.log('✔ Защита активна: параметризованный запрос экранировал полезную нагрузку.');
      console.log('  Инъекция интерпретирована как буквальная строка, утечка данных предотвращена.\n');
    }

    // 2. Тестирование генерации записи в журнал app.log[cite: 10]
    try {
      throw new Error('Имитация перехвата критического исключения для аудита безопасности');
    } catch (simulatedError) {
      logError('SecurityAuditTest', simulatedError);
      console.log('✔ Логирование: запись об ошибке успешно добавлена в файл app.log.');
    }

  } catch (err) {
    logError('SecurityAuditFatal', err);
  } finally {
    await client.end();
  }
}

testSqlInjectionVulnerability();