const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

  if (req.method === 'GET' && pathParts[0] === 'items' && pathParts.length === 2) {
    const id = Number(pathParts[1]);

    fs.readFile('data.json', 'utf8', (err, data) => {
      if (err) {
        res.statusCode = 500;
        res.end('Internal Server Error');
        return;
      }

      try {
        const items = JSON.parse(data);
        const item = items.find(i => i.id === id);

        if (!item) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(item));
      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON');
      }
    });

    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});