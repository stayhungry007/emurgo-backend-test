import { createHash } from 'crypto';

/**
 * Generates SHA-256 hash of the provided string input.
 * @param input - The string to be hashed.
 * @returns The SHA-256 hash as a hexadecimal string.
 */
export const sha256 = (input: string): string => {
  if (typeof input !== 'string') {
    throw new Error('Input must be a string');
  }
  return createHash('sha256').update(input, 'utf8').digest('hex');
};
