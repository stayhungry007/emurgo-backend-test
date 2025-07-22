import type { FastifyInstance } from 'fastify';

export async function setupErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((error, request, reply) => {
    // Ensure no further response is sent
    if (!reply.sent) {
      reply.status(500).send({
        message: error.message || 'Internal Server Error',
        code: 'INTERNAL_ERROR',
        error: error.stack,
      });
    }
  });
}
