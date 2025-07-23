import { Pool } from 'pg';

// Initialize the database connection pool
export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'emurgo_test',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rabbit',
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error if connection takes longer than 2 seconds
});

// Optional: Add a check to ensure the database connection is successful
db.on('connect', (client) => {
  console.log('Database connection established');
});

db.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(1);
});

export default db;