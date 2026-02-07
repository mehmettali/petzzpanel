import http from 'http';

http.get('http://localhost:3001/api/storefront/status', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    console.log(data);
    process.exit(0);
  });
}).on('error', (e) => {
  console.error('Error:', e.message);
  process.exit(1);
});
