const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { calculateRequiredMaterial } = require('./materialCalculator');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sales_db',
  password: '1494',
  port: 5432,
});

client.connect()
  .then(() => {
    console.log('Подключение к PostgreSQL успешно установлено.');
  })
  .catch((err) => {
    console.error('Ошибка подключения к PostgreSQL:', err);
  });

function parseRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
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
    if (pathname === '/api/product-types' && req.method === 'GET') {
      const result = await client.query('SELECT id, name, coefficient FROM product_types ORDER BY id ASC;');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
      return;
    }

    if (pathname === '/api/material-types' && req.method === 'GET') {
      const result = await client.query('SELECT id, name, defect_rate FROM material_types ORDER BY id ASC;');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
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
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
          success: false,
          result: -1,
          errorMessage: 'Ошибка расчета сырья. Проверьте правильность введенных параметров (значения должны быть больше 0).'
        }));
        return;
      }

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        success: true,
        result: calculatedResult
      }));
      return;
    }

    let fileName = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    fileName = decodeURIComponent(fileName);
    const filePath = path.join(__dirname, fileName);
    const ext = path.extname(filePath).toLowerCase();

    let contentType = 'text/html';
    if (ext === '.css') contentType = 'text/css';
    if (ext === '.png') contentType = 'image/png';
    if (ext === '.js') contentType = 'application/javascript';

    fs.readFile(filePath, (err, content) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404: Страница не найдена');
      } else {
        res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
        res.end(content);
      }
    });

  } catch (serverError) {
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      success: false,
      result: -1,
      errorMessage: 'Внутренняя ошибка сервера при обращении к базе данных.'
    }));
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер калькулятора запущен: http://127.0.0.1:${PORT}`);
});