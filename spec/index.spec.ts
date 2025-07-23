import { expect, test, describe, it } from "bun:test";

import { build } from './app'; // Fastify app instance (adjust this import to your app's structure)
import type { Block } from '../src/models/blockModel'; // Block type

const mockAddress = 'addr1';
const validTxId = 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0'; // 64 alphanumeric characters

describe('POST /blocks', () => {

  it('should return 400 for invalid block height', async () => {
    const block: Block = {
      id: 'block-id-1',
      height: 1,  // Valid height for first block
      transactions: [{
        id: validTxId,
        inputs: [],
        outputs: [{ address: mockAddress, value: 10 }]
      }]
    };

    const response = await build().inject({
      method: 'POST',
      url: '/blocks',
      payload: block,
    });

    expect(response.statusCode).toBe(400);
    expect(response.json().message).toContain('Invalid block height');
  });

//   it('should return 400 for mismatched input/output sum', async () => {
//     const block: Block = {
//       id: 'block-id-2',
//       height: 2,  // Valid height
//       transactions: [
//         {
//           id: validTxId,
//           inputs: [{ txId: validTxId, index: 0, value: 5 }],
//           outputs: [
//             { address: mockAddress, value: 5 },  // Sum of inputs != sum of outputs
//           ],
//         },
//       ],
//     };

//     const response = await build().inject({
//       method: 'POST',
//       url: '/blocks',
//       payload: block,
//     });

//     expect(response.statusCode).toBe(400);
//     expect(response.json().message).toContain('Invalid inputs/outputs balance');
//   });

//   it('should return 400 for invalid block ID format', async () => {
//     const block: Block = {
//       id: 'invalid-block-id',  // Invalid block ID (not a 64 character sha256 hash)
//       height: 2,  // Valid height
//       transactions: [
//         {
//           id: validTxId,
//           inputs: [],
//           outputs: [{ address: mockAddress, value: 10 }]
//         }
//       ]
//     };

//     const response = await build().inject({
//       method: 'POST',
//       url: '/blocks',
//       payload: block,
//     });

//     expect(response.statusCode).toBe(400);
//     expect(response.json().message).toContain('Invalid block ID');
//   });

//   it('should process a block and update balances', async () => {
//     const block: Block = {
//       id: 'block-id-3',
//       height: 3,
//       transactions: [
//         {
//           id: validTxId,
//           inputs: [{ txId: validTxId, index: 0, value: 5}],
//           outputs: [
//             { address: 'addr2', value: 5 },
//             { address: 'addr3', value: 5 },
//           ],
//         },
//       ],
//     };

//     const response = await build().inject({
//       method: 'POST',
//       url: '/blocks',
//       payload: block,
//     });

//     expect(response.statusCode).toBe(200);
//     expect(response.json().message).toContain('Block processed successfully');
//   });

// });

// describe('GET /balance/:address', () => {

//   it('should return the correct balance for an address', async () => {
//     const response = await build().inject({
//       method: 'GET',
//       url: '/balance/addr1',
//     });

//     expect(response.statusCode).toBe(200);
//     expect(response.json().balance).toBe(10);  // Assuming addr1 has a balance of 10
//   });

//   it('should return 0 balance for an address with no transactions', async () => {
//     const response = await build().inject({
//       method: 'GET',
//       url: '/balance/addr-nonexistent',
//     });

//     expect(response.statusCode).toBe(404);
//     expect(response.json().message).toContain('Address not found');
//   });

// });

// describe('POST /rollback', () => {

//   it('should rollback the blockchain to the given height', async () => {
//     const block1: Block = {
//       id: 'block-id-1',
//       height: 1,
//       transactions: [
//         {
//           id: validTxId,
//           inputs: [],
//           outputs: [{ address: mockAddress, value: 10 }],
//         },
//       ],
//     };

//     const block2: Block = {
//       id: 'block-id-2',
//       height: 2,
//       transactions: [
//         {
//           id: validTxId,
//           inputs: [{ txId: validTxId, index: 0, value: 10 }],
//           outputs: [
//             { address: 'addr2', value: 5 },
//             { address: 'addr3', value: 5 },
//           ],
//         },
//       ],
//     };

//     // First, process the blocks
//     await build().inject({
//       method: 'POST',
//       url: '/blocks',
//       payload: block1,
//     });

//     await build().inject({
//       method: 'POST',
//       url: '/blocks',
//       payload: block2,
//     });

//     // Now, call rollback to block height 1
//     const response = await build().inject({
//       method: 'POST',
//       url: '/rollback?height=1',
//     });

//     expect(response.statusCode).toBe(200);
//     expect(response.json().message).toContain('Rollback to height 1 completed successfully');
//   });

//   it('should return 400 if rollback height is invalid', async () => {
//     const response = await build().inject({
//       method: 'POST',
//       url: '/rollback?height=1000',
//     });

//     expect(response.statusCode).toBe(400);
//     expect(response.json().message).toContain('Invalid rollback height');
//   });

});


