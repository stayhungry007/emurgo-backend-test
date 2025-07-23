import type { FastifyRequest, FastifyReply } from "fastify";
import type { Block } from "../models/blockModel"; // Import Block type
import { BlockchainService } from "../services/blockService";
import { pino } from 'pino';

const logger = pino();

interface GetBalanceParams {
  address: string;
}

interface RollbackQuery {
  height: string;
}

export class BlocksController {
  private blockchainService: BlockchainService;

  constructor(db: any) {
    this.blockchainService = new BlockchainService(db);
  }

  async handlePostBlock(req: FastifyRequest, reply: FastifyReply) {
    const block: Block = req.body as Block;
    try {
      logger.info("Started processing block", { block });
      await this.blockchainService.processBlock(block);
      if (!reply.sent) {
        reply.code(200).send({ message: 'Block processed successfully' });
      }
    } catch (err: unknown) {
      logger.error('Error during block processing', { err });
      if (!reply.sent) {
        if (err instanceof Error) {
          reply.code(400).send({
            message: err.message,
            error: err.stack,
            code: 'BLOCK_PROCESSING_ERROR',
          });
        } else {
          reply.code(400).send({
            message: 'An unknown error occurred',
            code: 'UNKNOWN_ERROR',
          });
        }
      }
    }
  }

  async handleGetBalance(req: FastifyRequest<{ Params: GetBalanceParams }>, reply: FastifyReply) {
    const { address } = req.params;
    try {
      logger.info(`Fetching balance for address: ${address}`);
      const balance = await this.blockchainService.getBalance(address);
      if (!reply.sent) {
        reply.send({ address, balance });
      }
    } catch (err: unknown) {
      logger.error('Error during balance fetch', { err });
      if (!reply.sent) {
        if (err instanceof Error) {
          reply.code(400).send({
            message: err.message,
            error: err.stack,
            code: 'BALANCE_FETCH_ERROR',
          });
        } else {
          reply.code(400).send({
            message: 'An unknown error occurred',
            code: 'UNKNOWN_ERROR',
          });
        }
      }
    }
  }

  async handleRollback(req: FastifyRequest<{ Querystring: RollbackQuery }>, reply: FastifyReply) {
    const { height } = req.query;
    if (isNaN(Number(height)) || Number(height) <= 0) {
      reply.code(400).send({
        message: 'Invalid block height',
        code: 'INVALID_BLOCK_HEIGHT',
      });
      return;
    }

    try {
      logger.info(`Rolling back to block height: ${height}`);
      await this.blockchainService.rollbackToHeight(Number(height));
      reply.send({ message: `Rolled back to height ${height}` });
    } catch (err: unknown) {
      logger.error('Error during rollback', { err });
      if (!reply.sent) {
        if (err instanceof Error) {
          reply.code(400).send({
            message: err.message,
            error: err.stack,
            code: "ROLLBACK_ERROR",
          });
        } else {
          reply.code(400).send({
            message: "An unknown error occurred",
            code: "UNKNOWN_ERROR",
          });
        }
      }
    }
  }
}



// import type { FastifyRequest, FastifyReply } from "fastify";
// import type { Block } from "../models/blockModel"; // Import Block type
// import { BlockchainService } from "../services/blockService";

// interface GetBalanceParams {
//   address: string; // 'address' is expected to be a string in the params
// }

// interface RollbackQuery {
//   height: string; // height will be a string in the query, as URL parameters are strings by default
// }

// export class BlocksController {
//   private blockchainService: BlockchainService;

//   constructor(db: any) {
//     this.blockchainService = new BlockchainService(db);
//   }

//   // Handle the POST request to process a new block
//   async handlePostBlock(req: FastifyRequest, reply: FastifyReply) {
//   const block: Block = req.body as Block;
//   try {
//     await this.blockchainService.processBlock(block);
//     if (!reply.sent) {
//       reply.code(200).send({ message: 'Block processed successfully' });
//     }
//   } catch (err: unknown) {
//     if (!reply.sent) {
//       if (err instanceof Error) {
//         reply.code(400).send({
//           message: err.message,
//           error: err.stack,
//           code: 'BLOCK_PROCESSING_ERROR',
//         });
//       } else {
//         reply.code(400).send({
//           message: 'An unknown error occurred',
//           code: 'UNKNOWN_ERROR',
//         });
//       }
//     }
//   }
// }


//   // Handle the GET request to get the balance for an address
//   async handleGetBalance(req: FastifyRequest<{ Params: GetBalanceParams }>, reply: FastifyReply) {
//   const { address } = req.params;
//   try {
//     const balance = await this.blockchainService.getBalance(address);
//     if (!reply.sent) {
//       reply.send({ address, balance });
//     }
//   } catch (err: unknown) {
//     if (!reply.sent) {
//       if (err instanceof Error) {
//         reply.code(400).send({
//           message: err.message,
//           error: err.stack,
//           code: 'BALANCE_FETCH_ERROR',
//         });
//       } else {
//         reply.code(400).send({
//           message: 'An unknown error occurred',
//           code: 'UNKNOWN_ERROR',
//         });
//       }
//     }
//   }
// }


//   // Handle the POST request to rollback to a specific block height
//   async handleRollback(
//     req: FastifyRequest<{ Querystring: RollbackQuery }>,
//     reply: FastifyReply
//   ) {
//     const { height } = req.query;
//     try {
//       await this.blockchainService.rollbackToHeight(Number(height));
//       reply.send({ message: `Rolled back to height ${height}` });
//     } catch (err: unknown) {
//       if (err instanceof Error) {
//         reply.code(400).send({
//           message: err.message,
//           error: err.stack,
//           code: "ROLLBACK_ERROR",
//         });
//       } else {
//         reply.code(400).send({
//           message: "An unknown error occurred",
//           code: "UNKNOWN_ERROR",
//         });
//       }
//     }
//   }
// }
