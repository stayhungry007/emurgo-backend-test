import Fastify from 'fastify';
import { blockRoutes } from '../src/routes/blockRoutes'; // Import the routes
import { db } from './db'; // Import the database connection pool
import { initDb } from '../src/config/initDB';
import { setupErrorHandler } from '../src/utils/errorHandler';

export function build() {
  const fastify = Fastify({
    logger: true, // Enable logging
  });

  // Set up error handler
  setupErrorHandler(fastify);

  // Add db property to the Fastify instance
  fastify.decorate('db', db);

  fastify.addHook('onReady', async () => {
    try {
      await initDb(fastify.db); // Initialize the database (create tables if necessary)
      fastify.log.info('Test Database initialized successfully!');
    } catch (err) {
      fastify.log.error('Error initializing the test database:', err);
      process.exit(1); // Exit the process if database initialization fails
    }
  });

  // Register routes
  fastify.register(blockRoutes);

  return fastify;
}
