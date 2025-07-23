import type { FastifyInstance } from 'fastify';
import { BlocksController } from '../controllers/blockController';
import { blockValidator } from '../validators/blockValidator'; // Import the validator

export async function blockRoutes(fastify: FastifyInstance) {
  const blocksController = new BlocksController(fastify.db);

  // Apply the validation schema to the POST /blocks route
  fastify.post('/blocks', {
    schema: {
      ...blockValidator, // Use the imported blockValidator
      description: 'Create a new block with transactions',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
        400: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            error: { type: 'string' },
          },
        },
      },
    },
  }, blocksController.handlePostBlock.bind(blocksController));

  // GET /balance/:address to get balance for an address
  fastify.get('/balance/:address', {
    schema: {
      description: 'Get the balance for a specific address',
      params: {
        type: 'object',
        properties: {
          address: { type: 'string' },
        },
        required: ['address'],
      },
      response: {
        200: {
          type: 'object',
          properties: {
            address: { type: 'string' },
            balance: { type: 'number' },
          },
        },
      },
    },
  }, blocksController.handleGetBalance.bind(blocksController));

  // POST /rollback to rollback the blockchain to a specific block height
  fastify.post('/rollback', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          height: { type: 'number' },
        },
        required: ['height'],
      },
      description: 'Rollback the blockchain to a specific block height',
      response: {
        200: {
          type: 'object',
          properties: {
            message: { type: 'string' },
          },
        },
      },
    },
  }, blocksController.handleRollback.bind(blocksController));
}
