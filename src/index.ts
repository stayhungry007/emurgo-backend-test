import Fastify from 'fastify';
import { db } from './config/database'; // Import the database connection pool
import { blockRoutes } from './routes/blockRoutes'; // Import the block routes
import { initDb } from './config/initDB'; // Import the initDb function
import { setupErrorHandler } from './utils/errorHandler';

const fastify = Fastify();

setupErrorHandler(fastify);
const serverPort = process.env.PORT || 3000;
const serverHost = process.env.HOST || '0.0.0.0'
// Add the db property to the Fastify instance
fastify.decorate('db', db);

// Run the DB initialization before the app starts accepting requests
fastify.addHook('onReady', async () => {
  try {
    await initDb(fastify.db); // Initialize the database (create tables if necessary)
    console.log('Database initialized successfully!');
  } catch (err) {
    fastify.log.error('Error initializing the database:', err);
    process.exit(1); // Exit the process if database initialization fails
  }
});

// Register your routes
fastify.register(blockRoutes);

// Start the Fastify server with the new signature
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`Server listening at ${address}`);
});
