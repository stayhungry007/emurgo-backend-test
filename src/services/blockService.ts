import { sha256 } from '../utils/sha256';
import { BlockModel } from '../models/blockModel';
import type { Block } from '../models/blockModel';
import { Pool } from 'pg';

export class BlockchainService {
  private blockModel: BlockModel;
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
    this.blockModel = new BlockModel(db);
  }

  // Process a new block
  async processBlock(block: Block): Promise<void> {
    // Calculate the block ID (if not provided in the request)
    const calculatedBlockId = sha256(block.height + block.transactions.map(tx => tx.id).join(''));
    
    // Set the block ID if it's not already set in the request
    if (!block.id) {
      block.id = calculatedBlockId;
    }

    // Validate block data (now using the calculated ID)
    await this.validateBlock(block);
    
    // Process the block (insert into DB, update balances)
    await this.blockModel.createBlock(block);
    await this.updateBalances(block);
  }

  // Validate the block data
  private async validateBlock(block: Block): Promise<void> {
    // Validate block height
    const currentHeight = await this.blockModel.getCurrentHeight();
    if (block.height !== currentHeight + 1) {
      throw new Error(`Invalid block height. Expected ${currentHeight + 1}, got ${block.height}`);
    }

    // Validate the block ID
    const blockHash = sha256(block.height + block.transactions.map(tx => tx.id).join(''));
    if (block.id !== blockHash) {
      throw new Error(`Block ID is invalid`);
    }

    // Further transaction validation
    for (const tx of block.transactions) {
      if (block.height === 1) {
        // Genesis block: no inputs, validate that outputs are positive
        const outputTotal = tx.outputs.reduce((sum, output) => sum + output.value, 0);
        if (outputTotal <= 0) {
          throw new Error(`Transaction ${tx.id} in the genesis block has invalid outputs`);
        }
      } else {
        // Validate input-output balance for subsequent blocks
        const inputTotal = tx.inputs.reduce((sum, input) => sum + input.value, 0);
        const outputTotal = tx.outputs.reduce((sum, output) => sum + output.value, 0);
        if (inputTotal !== outputTotal) {
          throw new Error(`Transaction ${tx.id} has invalid inputs/outputs balance`);
        }
      }
    }
  }

  // Update balances for all addresses in the block
  private async updateBalances(block: Block): Promise<void> {
    for (const tx of block.transactions) {
      for (const output of tx.outputs) {
        await this.updateBalance(output.address, output.value);
      }
      for (const input of tx.inputs) {
        const prevTx = await this.blockModel.getTransaction(input.txId);
        const prevOutput = prevTx.outputs[input.index];
        await this.updateBalance(prevOutput.address, -prevOutput.value);  // Subtract spent value
      }
    }
  }

  private async updateBalance(address: string, value: number): Promise<void> {
    const currentBalance = await this.blockModel.getBalance(address);
    const newBalance = currentBalance + value;
    await this.blockModel.updateBalance(address, newBalance);
  }

  // Rollback to a specific height
  async rollbackToHeight(height: number): Promise<void> {
    await this.blockModel.rollbackToHeight(height);
  }

  // Fetch balance for an address
  async getBalance(address: string): Promise<number> {
    try {
      const balance = await this.blockModel.getBalance(address);  // Assumes getBalance is implemented in BlockModel
      return balance;
    } catch (err) {
      throw new Error('Failed to fetch balance');
    }
  }
}
