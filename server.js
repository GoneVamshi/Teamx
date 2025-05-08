import express from 'express';
import cors from 'cors';
import { connect } from './js/db.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Connect to database when server starts
connect().catch(console.error);

// Serve static files
app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});