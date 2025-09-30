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
 * This ensures the application has data to work with on first run.
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

// Initialize the file when the server starts.
initializeProductsFile();

/**
 * Retrieves all products from the data source.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    // Ensure the file exists before trying to read it.
    await fs.ensureFile(productsFilePath);
    const data = await fs.readJson(productsFilePath);
    return data || [];
  } catch (e) {
    console.error("Could not read products file, returning initial data.", e);
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
    await fs.writeJson(productsFilePath, updatedProducts, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save products to file.", e);
    // In a real app, you might want to throw the error to be handled by the caller.
  }
}
