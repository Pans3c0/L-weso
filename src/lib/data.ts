'use server';

import type { Product } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

const dbDirectory = '/app/src/lib/db';
const productsFilePath = path.join(dbDirectory, 'products.json');


/**
 * Retrieves all products from the data source, optionally filtered by sellerId.
 * @param sellerId - If provided, only returns products for that seller.
 * @returns A promise that resolves to an array of Product objects.
 */
export async function getAllProducts(sellerId?: string): Promise<Product[]> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.ensureFile(productsFilePath);
    const data: Product[] = await fs.readJson(productsFilePath, { throws: false }) || [];
    
    return sellerId ? data.filter((p: Product) => p.sellerId === sellerId) : data;
  } catch (e) {
    console.error("Could not read products file.", e);
    return [];
  }
}

/**
 * Saves a single product (adds or updates) to the data source.
 * @param productToSave - The product to be saved. If it has an ID, it updates; otherwise, it adds.
 * @returns A promise that resolves to the saved product.
 */
export async function saveProduct(productToSave: Omit<Product, 'id'> & { id?: string }): Promise<Product> {
  const allProducts = await getAllProducts();
  
  let finalProduct: Product;

  if (productToSave.id) {
    // Update existing product
    const index = allProducts.findIndex(p => p.id === productToSave.id);
    if (index > -1) {
      finalProduct = { ...allProducts[index], ...productToSave } as Product;
      allProducts[index] = finalProduct;
    } else {
      // If ID is provided but not found, treat as new (should not happen in normal flow)
      finalProduct = { ...productToSave, id: `prod_${Date.now()}` } as Product;
      allProducts.push(finalProduct);
    }
  } else {
    // Add new product
    finalProduct = { ...productToSave, id: `prod_${Date.now()}` } as Product;
    allProducts.push(finalProduct);
  }

  try {
    await fs.ensureDir(dbDirectory);
    await fs.outputJson(productsFilePath, allProducts, { spaces: 2 });
    return finalProduct;
  } catch (e) {
    console.error("Failed to save products to file.", e);
    throw new Error("Failed to save product.");
  }
}

/**
 * Deletes a product from the data source.
 * @param productId - The ID of the product to delete.
 */
export async function deleteProduct(productId: string): Promise<void> {
    const products = await getAllProducts();
    const updatedProducts = products.filter(p => p.id !== productId);
    try {
        await fs.ensureDir(dbDirectory);
        await fs.outputJson(productsFilePath, updatedProducts, { spaces: 2 });
    } catch (e) {
        console.error("Failed to delete product from file.", e);
    }
}
