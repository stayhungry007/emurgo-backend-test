import type { FastifyInstance } from 'fastify';
import { BlocksController } from '../controllers/blockController';
import { blockValidator } from '../validators/blockValidator'; // Import the validator

export async function blockRoutes(fastify: FastifyInstance) {
  const blocksController = new BlocksController(fastify.db);

  // Apply the validation schema to the POST /blocks route
  fastify.post('/blocks', {
    schema: blockValidator, // Use the imported blockValidator
  }, blocksController.handlePostBlock.bind(blocksController));

  fastify.get('/balance/:address', blocksController.handleGetBalance.bind(blocksController));
  fastify.post('/rollback', blocksController.handleRollback.bind(blocksController));
}
