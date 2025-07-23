import Fastify from 'fastify';
import { db } from './config/database'; // Import the database connection pool
import { blockRoutes } from './routes/blockRoutes'; // Import the block routes
import { initDb } from './config/initDB'; // Import the initDb function
import { setupErrorHandler } from './utils/errorHandler';

const fastify = Fastify({
  logger: true, // Enable logging (you can customize logging configuration here)
});

setupErrorHandler(fastify);

const serverPort = Number(process.env.PORT) || 3000;
const serverHost = process.env.HOST || '0.0.0.0';

// Validate essential environment variables
if (!process.env.PORT) {
  fastify.log.error('PORT environment variable is missing');
  process.exit(1);
}

// Add the db property to the Fastify instance
fastify.decorate('db', db);

// Run the DB initialization before the app starts accepting requests
fastify.addHook('onReady', async () => {
  try {
    await initDb(fastify.db); // Initialize the database (create tables if necessary)
    fastify.log.info('Database initialized successfully!');
  } catch (err) {
    fastify.log.error('Error initializing the database:', err);
    process.exit(1); // Exit the process if database initialization fails
  }
});

// Register your routes
fastify.register(blockRoutes);

// Graceful shutdown handler
process.on('SIGINT', async () => {
  fastify.log.info('Received SIGINT, shutting down...');
  await fastify.close();
  process.exit(0);
});

// Start the Fastify server
fastify.listen({ port: serverPort, host: serverHost }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});