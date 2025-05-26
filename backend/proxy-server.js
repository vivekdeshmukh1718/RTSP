const express = require('express');
const request = require('request');
const cors = require('cors');

const app = express();
const PORT = 8080;

app.use(cors()); // Enable CORS for all origins

// Proxy endpoint to fetch remote streams
app.get('/proxy', (req, res) => {
  const url = req.query.url;
  if (!url) {
    console.error('Missing url query parameter');
    return res.status(400).send('Missing url query parameter');
  }
  console.log('Proxying request for:', url);
  request
    .get(url)
    .on('error', (err) => {
      console.error('Error fetching stream:', err.message);
      res.status(500).send('Error fetching stream: ' + err.message);
    })
    .pipe(res);
});


app.listen(PORT, () => {
  console.log(`Proxy server listening on http://localhost:${PORT}`);
});
