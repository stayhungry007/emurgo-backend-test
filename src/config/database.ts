import { Pool } from 'pg';

export const db = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'emurgo',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'rabbit',
  // connectionString: process.env.DATABASE_URL,
  max: 10, // maximum number of clients in the pool
  idleTimeoutMillis: 30000, // close idle clients after 30 seconds
  connectionTimeoutMillis: 2000, // return an error if connection takes longer than 2 seconds
});
