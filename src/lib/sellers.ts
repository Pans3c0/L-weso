'use server';

import type { Seller } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialSellers } from '@/lib/mock-data';

const sellersFilePath = path.resolve(process.cwd(), 'src/lib/db/sellers.json');

/**
 * Retrieves all sellers from the data source.
 * If the file doesn't exist or is empty, it's initialized with seed data.
 * @returns A promise that resolves to an array of Seller objects.
 */
export async function getAllSellers(): Promise<Seller[]> {
  try {
    const data = await fs.readJson(sellersFilePath, { throws: false });
    if (!data) {
      await fs.outputJson(sellersFilePath, initialSellers, { spaces: 2 });
      return initialSellers;
    }
    return data;
  } catch (e) {
    console.error("Could not read or initialize sellers file, returning fallback data.", e);
    return initialSellers;
  }
}

/**
 * Saves the entire list of sellers to the data source.
 * @param updatedSellers - The full array of sellers to save.
 */
export async function saveSellers(updatedSellers: Seller[]): Promise<void> {
  try {
    await fs.outputJson(sellersFilePath, updatedSellers, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save sellers to file.", e);
  }
}
