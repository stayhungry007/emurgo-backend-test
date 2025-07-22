import type { FastifySchema } from 'fastify';

export const blockValidator: FastifySchema = {
  body: {
    type: 'object',
    required: ['height', 'transactions'],
    properties: {
      height: { type: 'integer' },
      transactions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'inputs', 'outputs'],
          properties: {
            id: { type: 'string' },
            inputs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['txId', 'index'],
                properties: {
                  txId: { type: 'string' },
                  index: { type: 'integer' }
                }
              }
            },
            outputs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['address', 'value'],
                properties: {
                  address: { type: 'string' },
                  value: { type: 'integer' }
                }
              }
            }
          }
        }
      }
    }
  }
};
