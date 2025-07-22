// src/types/fastify.d.ts
import { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool; // Adding 'db' property to the FastifyInstance type
  }
}