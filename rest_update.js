const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const pathParts = parsedUrl.pathname.split('/').filter(Boolean);

  if (req.method === 'PUT' && pathParts[0] === 'items' && pathParts.length === 2) {
    const id = Number(pathParts[1]);
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      let updates;

      try {
        updates = JSON.parse(body);
      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON body');
        return;
      }

      fs.readFile('data.json', 'utf8', (err, data) => {
        if (err) {
          res.statusCode = 500;
          res.end('Internal Server Error');
          return;
        }

        let items;
        try {
          items = JSON.parse(data);
        } catch (e) {
          res.statusCode = 400;
          res.end('Invalid JSON in file');
          return;
        }

        const index = items.findIndex(i => i.id === id);

        if (index === -1) {
          res.statusCode = 404;
          res.end('Not Found');
          return;
        }

        items[index] = { ...items[index], ...updates };

        fs.writeFile('data.json', JSON.stringify(items, null, 2), err => {
          if (err) {
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
          }

          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(items[index]));
        });
      });
    });

    return;
  }

  res.statusCode = 404;
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});