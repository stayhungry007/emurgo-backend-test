import type { FastifyInstance } from 'fastify';
import { pino } from 'pino';

const logger = pino(); // Using pino for logging

export async function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    // Log the error details for debugging
    logger.error({
      err: error,
      method: request.method,
      url: request.url,
      body: request.body,
      params: request.params,
      query: request.query,
    });

    // Ensure no further response is sent
    if (!reply.sent) {
      // Handle known error types
      if (error.validation) {
        reply.status(400).send({
          message: error.message || 'Bad Request',
          code: 'VALIDATION_ERROR',
          details: error.validation,
        });
      } else if (error.code === 'SQLITE_ERROR' || error.code === 'ECONNREFUSED') {
        // Handle database-related errors with specific messages
        reply.status(500).send({
          message: 'Database Error',
          code: 'DATABASE_ERROR',
          error: error.stack,
        });
      } else {
        // Default for unknown errors
        reply.status(500).send({
          message: error.message || 'Internal Server Error',
          code: 'INTERNAL_ERROR',
          error: error.stack,
        });
      }
    }
  });
}