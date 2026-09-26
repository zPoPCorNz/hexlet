const http = require('http');
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const { calculatePartnerDiscount } = require('./discount');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'sales_db',
  password: '1494',
  port: 5432,
});

client.connect()
  .then(() => console.log('Подключение к PostgreSQL успешно установлено.'))
  .catch((err) => console.error('Ошибка подключения к PostgreSQL:', err));

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
    if (pathname === '/api/partners' && req.method === 'GET') {
      const query = `
        SELECT 
          p.id, p.type, p.name, p.director, p.phone, p.rating, p.address, p.email,
          COALESCE(SUM(s.quantity), 0)::INT AS total_quantity
        FROM partners p
        LEFT JOIN sales_history s ON p.id = s.partner_id
        GROUP BY p.id, p.type, p.name, p.director, p.phone, p.rating, p.address, p.email
        ORDER BY p.id ASC;
      `;
      const result = await client.query(query);
      const data = result.rows.map((row) => ({
        ...row,
        discountPercent: calculatePartnerDiscount(row.total_quantity || 0),
      }));

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
      return;
    }

    const partnerIdMatch = pathname.match(/^\/api\/partners\/(\d+)$/);
    if (partnerIdMatch && req.method === 'GET') {
      const id = parseInt(partnerIdMatch[1], 10);
      const result = await client.query('SELECT * FROM partners WHERE id = $1;', [id]);

      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Партнер с указанным ID не найден.' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0]));
      }
      return;
    }

    if (pathname === '/api/partners' && req.method === 'POST') {
      const body = await parseRequestBody(req);
      const rating = parseInt(body.rating, 10);

      if (!body.name || !body.email || isNaN(rating) || rating < 0) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Некорректные данные: проверьте рейтинг, наименование и email.' }));
        return;
      }

      const query = `
        INSERT INTO partners (type, name, director, phone, rating, address, email)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *;
      `;
      const values = [
        body.type,
        body.name,
        body.director || '',
        body.phone || '',
        rating,
        body.address || '',
        body.email,
      ];

      const result = await client.query(query, values);
      res.writeHead(201, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows[0]));
      return;
    }

    if (partnerIdMatch && req.method === 'PUT') {
      const id = parseInt(partnerIdMatch[1], 10);
      const body = await parseRequestBody(req);
      const rating = parseInt(body.rating, 10);

      if (!body.name || !body.email || isNaN(rating) || rating < 0) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Некорректные данные при обновлении.' }));
        return;
      }

      const query = `
        UPDATE partners 
        SET type = $1, name = $2, director = $3, phone = $4, rating = $5, address = $6, email = $7
        WHERE id = $8
        RETURNING *;
      `;
      const values = [
        body.type,
        body.name,
        body.director || '',
        body.phone || '',
        rating,
        body.address || '',
        body.email,
        id,
      ];

      const result = await client.query(query, values);
      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Партнер для обновления не найден.' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0]));
      }
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
        res.end('404: Ресурс не найден');
      } else {
        res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
        res.end(content);
      }
    });

  } catch (globalErr) {
    console.error('Ошибка сервера:', globalErr);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Внутренняя ошибка сервера СУБД.' }));
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://127.0.0.1:${PORT}`);
});