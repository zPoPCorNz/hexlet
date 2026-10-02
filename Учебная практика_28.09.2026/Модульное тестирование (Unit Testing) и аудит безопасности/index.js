const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { calculateRequiredMaterial } = require('./materialCalculator');
const { logError } = require('./logger');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sales_db',
  password: '1494',
  port: 5432,
});

client.connect()
  .then(() => console.log('Подключение к PostgreSQL успешно установлено.'))
  .catch((err) => logError('DatabaseConnection', err));

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(err);
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  const urlParts = req.url.split('?');
  const pathname = urlParts[0];

  try {

    if (pathname === '/api/partners/search' && req.method === 'GET') {
      const searchParam = new URLSearchParams(urlParts[1] || '').get('query') || '';
      
      const safeQuery = `
        SELECT id, type, name, rating, phone, email 
        FROM partners 
        WHERE name ILIKE $1 OR director ILIKE $1
        ORDER BY id ASC;
      `;
      const result = await client.query(safeQuery, [`%${searchParam}%`]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
      return;
    }

    if (pathname === '/api/partners' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const rating = parseInt(body.rating, 10);

      if (!body.name || !body.email || isNaN(rating) || rating < 0) {
        throw new Error('Некорректные параметры создания партнера (валидация не пройдена).');
      }

      const insertQuery = `
        INSERT INTO partners (type, name, director, phone, rating, address, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [
        body.type || 'ООО',
        body.name,
        body.director || '',
        body.phone || '',
        rating,
        body.address || '',
        body.email,
      ];

      const result = await client.query(insertQuery, values);
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    if (pathname === '/api/calculate-material' && req.method === 'POST') {
      const payload = await parseRequestBody(req);

      const productTypeId = parseInt(payload.productTypeId, 10);
      const materialTypeId = parseInt(payload.materialTypeId, 10);
      const quantity = parseInt(payload.quantity, 10);
      const param1 = parseFloat(payload.param1);
      const param2 = parseFloat(payload.param2);

      const calculatedResult = await calculateRequiredMaterial(
        productTypeId,
        materialTypeId,
        quantity,
        param1,
        param2,
        client
      );

      if (calculatedResult === -1) {
        logError('MaterialCalculation', `Некорректные параметры расчета: productTypeId=${productTypeId}, materialTypeId=${materialTypeId}, quantity=${quantity}, param1=${param1}, param2=${param2}`);
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: false, result: -1, error: 'Ошибка в параметрах расчета сырья.' }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, result: calculatedResult }));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404: Маршрут не найден');

  } catch (error) {

    logError('HTTP_Server_Exception', error);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Внутренняя ошибка сервера. Подробности записаны в журнал app.log.' }));
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер с аудитом безопасности запущен: http://127.0.0.1:${PORT}`);
});