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
    const fileExists = await fs.pathExists(sellersFilePath);
    if (!fileExists) {
      await fs.outputJson(sellersFilePath, initialSellers, { spaces: 2 });
      return initialSellers;
    }

    const data = await fs.readJson(sellersFilePath, { throws: false });
    if (!data || data.length === 0) {
      await fs.outputJson(sellersFilePath, initialSellers, { spaces: 2 });
      return initialSellers;
    }
    return data;
  } catch (e) {
    console.error("Could not read or initialize sellers file, returning fallback data.", e);
    return initialSellers;
  }
}
