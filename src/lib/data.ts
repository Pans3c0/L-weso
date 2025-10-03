'use server';

import type { Product } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialProducts } from '@/lib/mock-data';

// Resolve the path to the JSON file that acts as the database for products.
const productsFilePath = path.resolve(process.cwd(), 'src/lib/db/products.json');


/**
 * Retrieves all products from the data source.
 * If the data file does not exist or is empty, it initializes it with seed data.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    const data = await fs.readJson(productsFilePath, { throws: false });
    // If file doesn't exist, is null, or is an empty array, initialize it.
    if (!data || data.length === 0) {
      await fs.outputJson(productsFilePath, initialProducts, { spaces: 2 });
      return initialProducts;
    }
    return data;
  } catch (e) {
    console.error("Could not read or initialize products file, returning fallback data.", e);
    // If reading fails, return the default mock data as a fallback.
    return initialProducts;
  }
}

/**
 * Saves the entire list of products to the data source.
 * Note: This overwrites the existing file with the new data.
 * @param updatedProducts - The full array of products to save.
 * @returns A promise that resolves when the file has been written.
 */
export async function saveProducts(updatedProducts: Product[]): Promise<void> {
  try {
    await fs.outputJson(productsFilePath, updatedProducts, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save products to file.", e);
    // In a real app, you might want to throw the error to be handled by the caller.
  }
}
