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

async function getPartnersWithDiscounts() {
  const query = `
    SELECT 
      p.id,
      p.type,
      p.name,
      p.director,
      p.phone,
      p.rating,
      COALESCE(SUM(s.quantity), 0)::INT AS total_quantity
    FROM partners p
    LEFT JOIN sales_history s ON p.id = s.partner_id
    GROUP BY p.id, p.type, p.name, p.director, p.phone, p.rating
    ORDER BY p.id ASC;
  `;

  const response = await client.query(query);

  return response.rows.map((partner) => {
    const quantity = partner.total_quantity || 0;
    const discount = calculatePartnerDiscount(quantity);

    return {
      id: partner.id,
      type: partner.type,
      name: partner.name,
      director: partner.director,
      phone: partner.phone,
      rating: partner.rating,
      totalQuantity: quantity,
      discountPercent: discount,
    };
  });
}

const server = http.createServer(async (req, res) => {
  if (req.url === '/api/partners' && req.method === 'GET') {
    try {
      const data = await getPartnersWithDiscounts();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(data));
    } catch (error) {
      console.error('Ошибка при выборке данных:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
    return;
  }

  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  const extname = path.extname(filePath);
  let contentType = 'text/html';

  if (extname === '.css') contentType = 'text/css';
  if (extname === '.png') contentType = 'image/png';
  if (extname === '.jpg') contentType = 'image/jpeg';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Файл не найден');
    } else {
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
      res.end(content);
    }
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});