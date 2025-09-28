// Health check endpoint for Docker
const http = require('http');

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'price-oracle-rofl'
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const port = process.env.HEALTH_PORT || 3001;
server.listen(port, () => {
  console.log(`Health check server running on port ${port}`);
});

// For Docker health check
if (require.main === module) {
  // Make a request to the health endpoint
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/health',
    method: 'GET',
    timeout: 3000
  };
  
  const req = http.request(options, (res) => {
    if (res.statusCode === 200) {
      console.log('Health check passed');
      process.exit(0);
    } else {
      console.log('Health check failed');
      process.exit(1);
    }
  });
  
  req.on('error', () => {
    console.log('Health check failed');
    process.exit(1);
  });
  
  req.on('timeout', () => {
    console.log('Health check timeout');
    process.exit(1);
  });
  
  req.end();
}
