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

    const partnerMatch = pathname.match(/^\/api\/partners\/(\d+)$/);
    if (partnerMatch && req.method === 'GET') {
      const id = parseInt(partnerMatch[1], 10);
      const result = await client.query('SELECT * FROM partners WHERE id = $1;', [id]);
      if (result.rows.length === 0) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'Партнер не найден' }));
      } else {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(result.rows[0]));
      }
      return;
    }

    const historyMatch = pathname.match(/^\/api\/partners\/(\d+)\/history$/);
    if (historyMatch && req.method === 'GET') {
      const partnerId = parseInt(historyMatch[1], 10);

      const query = `
        SELECT 
          pr.name AS product_name,
          s.quantity,
          TO_CHAR(s.sale_date, 'DD.MM.YYYY') AS sale_date_formatted
        FROM sales_history s
        JOIN products pr ON s.product_id = pr.id
        WHERE s.partner_id = $1
        ORDER BY s.sale_date DESC;
      `;

      const result = await client.query(query, [partnerId]);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(result.rows));
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

  } catch (err) {
    console.error('Ошибка сервера:', err);
    res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

const PORT = 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://127.0.0.1:${PORT}`);
});