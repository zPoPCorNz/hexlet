const fs = require('fs');
const path = require('path');

const LOG_FILE_PATH = path.join(__dirname, 'app.log');

/**
 * Логирование ошибок в файл app.log по ТЗ: дата, время и понятный текст ошибки
 * @param {string} context - Название модуля/операции
 * @param {string|Error} error - Описание или объект исключения
 */
function logError(context, error) {
  const now = new Date();
  const dateFormatted = now.toISOString().replace('T', ' ').substring(0, 19);
  const errorMessage = error instanceof Error ? `${error.message}\nСтек: ${error.stack}` : String(error);

  const logEntry = `[${dateFormatted}] [ERROR] [${context}] ${errorMessage}\n`;

  fs.appendFile(LOG_FILE_PATH, logEntry, 'utf8', (err) => {
    if (err) {
      console.error('Не удалось записать событие в app.log:', err);
    }
  });

  console.error(`\x1b[31m${logEntry.trim()}\x1b[0m`);
}

module.exports = {
  logError,
  LOG_FILE_PATH,
};