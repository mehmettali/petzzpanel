import http from 'http';

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/storefront/status',
  method: 'GET',
  timeout: 5000
}, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    try {
      const s = JSON.parse(data);
      console.log('syncInProgress:', s.syncInProgress);
      console.log('totalProducts:', s.totalProducts);
      console.log('matchedProducts:', s.matchedProducts);
      console.log('lastSync:', s.lastSync);
    } catch(e) {
      console.log('Response:', data);
    }
  });
});

req.on('timeout', () => {
  console.log('Request timeout - server is busy');
  req.destroy();
});

req.on('error', (e) => console.log('Error:', e.message));
req.end();
