'use server';

import type { Product } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialProducts } from '@/lib/mock-data';

// Resolve the path to the JSON file that acts as the database for products.
const productsFilePath = path.resolve(process.cwd(), 'src/lib/db/products.json');

/**
 * Initializes the products data file.
 * If the `products.json` file doesn't exist, it creates it with initial seed data.
 */
async function initializeProductsFile() {
  try {
    await fs.ensureDir(path.dirname(productsFilePath));
    const exists = await fs.pathExists(productsFilePath);
    if (!exists) {
      await fs.writeJson(productsFilePath, initialProducts, { spaces: 2 });
    }
  } catch (error) {
    console.error('Failed to initialize products.json', error);
  }
}

/**
 * Retrieves all products from the data source.
 * It now ensures the file is initialized before reading.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getAllProducts(): Promise<Product[]> {
  await initializeProductsFile(); // Ensure file exists before reading
  try {
    const data = await fs.readJson(productsFilePath);
    return data || [];
  } catch (e) {
    console.error("Could not read products file, returning initial data.", e);
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
  await initializeProductsFile(); // Ensure file exists before writing
  try {
    await fs.writeJson(productsFilePath, updatedProducts, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save products to file.", e);
  }
}
