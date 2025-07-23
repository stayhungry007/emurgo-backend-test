import { Pool } from 'pg';

export async function initDb(db: Pool): Promise<void> {
  const client = await db.connect();

  try {
    // Begin the transaction
    await client.query('BEGIN');

    // Create the blocks table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS blocks (
        id VARCHAR(64) PRIMARY KEY,
        height INT NOT NULL
      );
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_blocks_height ON blocks (height);');

    // Create the transactions table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id VARCHAR(64) PRIMARY KEY,
        block_height INT NOT NULL REFERENCES blocks(height)
      );
    `);
    await client.query('CREATE INDEX IF NOT EXISTS idx_transactions_block_height ON transactions (block_height);');

    // Create the inputs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS inputs (
        tx_id VARCHAR(64) NOT NULL REFERENCES transactions(id),
        index INT NOT NULL,
        tx_id_reference VARCHAR(64) NOT NULL, -- Reference to previous transaction output
        value INT NOT NULL,
        PRIMARY KEY (tx_id, index)
      );
    `);

    // Create the outputs table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS outputs (
        tx_id VARCHAR(64) NOT NULL REFERENCES transactions(id),
        address VARCHAR(255) NOT NULL,
        value INT NOT NULL,
        PRIMARY KEY (tx_id, address)
      );
    `);

    // Create the balances table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS balances (
        address VARCHAR(255) PRIMARY KEY,
        balance INT DEFAULT 0
      );
    `);

    // Commit the transaction
    await client.query('COMMIT');
    console.log('Database tables created successfully or already exist.');
  } catch (error) {
    // Rollback the transaction if any error occurs
    await client.query('ROLLBACK');
    console.error('Error during database initialization:', error);
    throw error; // Rethrow the error so it can be handled at the app level
  } finally {
    // Release the database connection
    client.release();
  }
}
