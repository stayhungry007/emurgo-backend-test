import type { FastifySchema } from 'fastify';

export const blockValidator: FastifySchema = {
  body: {
    type: 'object',
    required: ['height', 'transactions'],
    properties: {
      height: { 
        type: 'integer', 
        minimum: 1, // Ensure height is a positive integer (if applicable)
      },
      transactions: {
        type: 'array',
        items: {
          type: 'object',
          required: ['id', 'inputs', 'outputs'],
          properties: {
            id: { 
              type: 'string',
              pattern: '^[a-zA-Z0-9]{64}$', // Example pattern for transaction ID (hexadecimal)
            },
            inputs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['txId', 'index'],
                properties: {
                  txId: { 
                    type: 'string', 
                    pattern: '^[a-zA-Z0-9]{64}$' // Example pattern for txId
                  },
                  index: { 
                    type: 'integer',
                    minimum: 0, // Ensure index is a non-negative integer
                  }
                }
              }
            },
            outputs: {
              type: 'array',
              items: {
                type: 'object',
                required: ['address', 'value'],
                properties: {
                  address: { 
                    type: 'string', 
                    format: 'email' // Optional: change to a more suitable format if needed
                  },
                  value: { 
                    type: 'integer', 
                    minimum: 1 // Ensure value is greater than 0
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};
