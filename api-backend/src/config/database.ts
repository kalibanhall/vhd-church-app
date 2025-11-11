import postgres from 'postgres';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL must be defined in .env file');
}

const sql = postgres(databaseUrl, {
  ssl: 'require',
  max: 10,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql;
