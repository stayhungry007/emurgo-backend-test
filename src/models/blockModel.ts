import { Pool } from 'pg';

export interface Input {
  txId: string;
  index: number;
  value: number;
}

export interface Output {
  address: string;
  value: number;
}

export interface Transaction {
  id: string;
  inputs: Input[];
  outputs: Output[];
}

export interface Block {
  id: string;
  height: number;
  transactions: Transaction[];
}

export class BlockModel {
  private db: Pool;

  constructor(db: Pool) {
    this.db = db;
  }

  // Create a block and its transactions in the database
  async createBlock(block: Block): Promise<void> {
  const client = await this.db.connect();
  try {
    await client.query('BEGIN');

    // Insert block
    const blockInsertQuery = 'INSERT INTO blocks(id, height) VALUES($1, $2)';
    await client.query(blockInsertQuery, [block.id, block.height]);

    // Insert transactions with proper placeholders
    const transactionValues = block.transactions.map(tx => `($1, $2)`).join(',');
    const transactionParams = block.transactions.map(tx => [tx.id, block.height]).flat();
    await client.query(`INSERT INTO transactions(id, block_height) VALUES ${transactionValues}`, transactionParams);

    // Insert inputs for all transactions with proper placeholders
    const inputValues = block.transactions.flatMap(tx => 
      tx.inputs.map(input => `($1, $2, $3, $4)`)
    ).join(',');
    const inputParams = block.transactions.flatMap(tx => 
      tx.inputs.map(input => [tx.id, input.index, input.txId, input.value])
    ).flat();
    await client.query(`INSERT INTO inputs(tx_id, index, tx_id_reference, value) VALUES ${inputValues}`, inputParams);

    // Insert outputs for all transactions with proper placeholders
    const outputValues = block.transactions.flatMap(tx => 
      tx.outputs.map(output => `($1, $2, $3)`)
    ).join(',');
    const outputParams = block.transactions.flatMap(tx => 
      tx.outputs.map(output => [tx.id, output.address, output.value])
    ).flat();
    await client.query(`INSERT INTO outputs(tx_id, address, value) VALUES ${outputValues}`, outputParams);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}



  // Get the transaction details by transaction ID
  async getTransaction(txId: string): Promise<Transaction> {
    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT t.id AS tx_id, t.block_height, 
               i.tx_id_reference AS input_tx_id, i.index AS input_index, i.value AS input_value,
               o.address AS output_address, o.value AS output_value
        FROM transactions t
        LEFT JOIN inputs i ON t.id = i.tx_id
        LEFT JOIN outputs o ON t.id = o.tx_id
        WHERE t.id = $1`, [txId]);

      if (result.rows.length === 0) {
        throw new Error('Transaction not found');
      }

      const transaction: Transaction = {
        id: result.rows[0].tx_id,
        inputs: result.rows.map(row => ({
          txId: row.input_tx_id,
          index: row.input_index,
          value: row.input_value
        })),
        outputs: result.rows.map(row => ({
          address: row.output_address,
          value: row.output_value
        }))
      };

      return transaction;
    } finally {
      client.release();
    }
  }

  // Get the balance of a given address
  async getBalance(address: string): Promise<number> {
    const client = await this.db.connect();
    try {
      const result = await client.query(`
        SELECT 
          COALESCE(SUM(outputs.value), 0) - COALESCE(SUM(inputs.value), 0) AS balance
        FROM outputs
        LEFT JOIN inputs ON outputs.tx_id = inputs.tx_id_reference
        WHERE outputs.address = $1`, [address]);

      return result.rows[0].balance;
    } finally {
      client.release();
    }
  }

  // Update the balance of an address
  async updateBalance(address: string, newBalance: number): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query(`
        INSERT INTO balances(address, balance) 
        VALUES($1, $2) 
        ON CONFLICT (address) 
        DO UPDATE SET balance = $2`, [address, newBalance]);
    } finally {
      client.release();
    }
  }

  // Rollback the blockchain to a specific block height
  async rollbackToHeight(height: number): Promise<void> {
    const client = await this.db.connect();
    try {
      await client.query('BEGIN');
      
      // Delete blocks and related transactions after the given height
      await client.query('DELETE FROM blocks WHERE height > $1', [height]);
      await client.query('DELETE FROM transactions WHERE block_height > $1', [height]);
      await client.query('DELETE FROM inputs WHERE tx_id IN (SELECT id FROM transactions WHERE block_height > $1)', [height]);
      await client.query('DELETE FROM outputs WHERE tx_id IN (SELECT id FROM transactions WHERE block_height > $1)', [height]);

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // Get the current height of the blockchain
  async getCurrentHeight(): Promise<number> {
    const client = await this.db.connect();
    try {
      const result = await client.query('SELECT MAX(height) AS current_height FROM blocks');
      return result.rows[0].current_height || 0;
    } finally {
      client.release();
    }
  }
}
