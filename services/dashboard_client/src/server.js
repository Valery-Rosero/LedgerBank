const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'dashboard_client' }));

app.listen(port, () => console.log(`dashboard_client escuchando en ${port}`));