// Test simple pour vérifier que le serveur Express fonctionne
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.get('/test', (req, res) => {
  res.json({ message: 'Server is working!', port: PORT });
});

app.listen(PORT, () => {
  console.log(`✅ Test server running on http://localhost:${PORT}`);
  console.log(`📍 Try: http://localhost:${PORT}/test`);
});
