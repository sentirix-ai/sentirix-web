const { createServer } = require('http');
const next = require('next');

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (err) => console.error('Unhandled Rejection:', err));

const port = parseInt(process.env.PORT || '3000', 10);
const app = next({ dev: false, dir: __dirname });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer((req, res) => {
    handle(req, res);
  });

  server.listen(port, '0.0.0.0', (err) => {
    if (err) {
      console.error('Failed to listen:', err);
      process.exit(1);
    }
    console.log(`> Sevaniq Web production server is running on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    console.error('Server HTTP error:', err);
  });
}).catch((err) => {
  console.error('Error starting server:', err);
  process.exit(1);
});

// Keep event loop alive indefinitely
setInterval(() => {}, 60000);
