const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const server = http.createServer((req, res) => {
  let requestPath = req.url.split('?')[0];
  let fileName = requestPath === '/' ? 'index.html' : requestPath.replace(/^\//, '');
  
  fileName = decodeURIComponent(fileName);
  
  const filePath = path.join(__dirname, fileName);
  const ext = path.extname(filePath).toLowerCase();

  let contentType = 'text/html';
  if (ext === '.css') contentType = 'text/css';
  if (ext === '.png') contentType = 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
  if (ext === '.js') contentType = 'application/javascript';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      console.log(`[Ошибка 404] Файл не найден по пути: ${filePath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(`404: Страница или ресурс не найден (${fileName})`);
    } else {
      res.writeHead(200, { 'Content-Type': `${contentType}; charset=utf-8` });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Сервер запущен: http://127.0.0.1:${PORT}`);
});