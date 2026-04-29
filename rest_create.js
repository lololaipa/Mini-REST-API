const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = process.argv[2] || 3000;

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  if (req.method === 'POST' && parsedUrl.pathname === '/items') {
    let body = '';

    req.on('data', chunk => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const newItem = JSON.parse(body);

        fs.readFile('data.json', 'utf8', (err, data) => {
          if (err) {
            res.statusCode = 500;
            res.end('Internal Server Error');
            return;
          }

          try {
            const items = JSON.parse(data);
            items.push(newItem);

            fs.writeFile('data.json', JSON.stringify(items, null, 2), err => {
              if (err) {
                res.statusCode = 500;
                res.end('Internal Server Error');
                return;
              }

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify(newItem));
            });

          } catch (e) {
            res.statusCode = 400;
            res.end('Invalid JSON in file');
          }
        });

      } catch (e) {
        res.statusCode = 400;
        res.end('Invalid JSON body');
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