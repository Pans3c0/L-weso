'use server';

import type { Product } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialProducts } from '@/lib/mock-data';

const productsFilePath = path.resolve(process.cwd(), 'src/lib/db/products.json');

/**
 * Retrieves all products from the data source, optionally filtered by sellerId.
 * @param sellerId - If provided, only returns products for that seller.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getAllProducts(sellerId?: string): Promise<Product[]> {
  try {
    const fileExists = await fs.pathExists(productsFilePath);
    if (!fileExists) {
        await fs.outputJson(productsFilePath, initialProducts, { spaces: 2 });
        const allProducts = initialProducts;
        return sellerId ? allProducts.filter(p => p.sellerId === sellerId) : allProducts;
    }

    const data = await fs.readJson(productsFilePath, { throws: false });
    if (!data || data.length === 0) {
      await fs.outputJson(productsFilePath, initialProducts, { spaces: 2 });
      const allProducts = initialProducts;
      return sellerId ? allProducts.filter(p => p.sellerId === sellerId) : allProducts;
    }
    
    return sellerId ? data.filter((p: Product) => p.sellerId === sellerId) : data;
  } catch (e) {
    console.error("Could not read or initialize products file, returning fallback data.", e);
    const allProducts = initialProducts;
    return sellerId ? allProducts.filter(p => p.sellerId === sellerId) : allProducts;
  }
}

/**
 * Saves a list of products to the data source.
 * This function handles both adding and updating products.
 * @param productsToSave - The array of products to be saved.
 * @returns A promise that resolves when the file has been written.
 */
export async function saveProducts(productsToSave: Product[]): Promise<void> {
  try {
    await fs.outputJson(productsFilePath, productsToSave, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save products to file.", e);
  }
}
