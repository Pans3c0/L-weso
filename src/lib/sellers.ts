'use server';

import type { Seller } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

const dbDirectory = '/app/src/lib/db';
const sellersFilePath = path.join(dbDirectory, 'sellers.json');

/**
 * Retrieves all sellers from the data source.
 * If the file doesn't exist or is empty, it's initialized with an empty array.
 * @returns A promise that resolves to an array of Seller objects.
 */
export async function getAllSellers(): Promise<Seller[]> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.ensureFile(sellersFilePath);
    const data = await fs.readJson(sellersFilePath, { throws: false });
    return data || [];
  } catch (e) {
    console.error("Could not read or initialize sellers file.", e);
    return [];
  }
}

/**
 * Saves the entire list of sellers to the data source.
 * @param updatedSellers - The full array of sellers to save.
 */
export async function saveSellers(updatedSellers: Seller[]): Promise<void> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.outputJson(sellersFilePath, updatedSellers, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save sellers to file.", e);
  }
}
