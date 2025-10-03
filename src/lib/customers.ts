'use server';

import type { Customer } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialCustomers } from '@/lib/mock-data';

const customersFilePath = path.resolve(process.cwd(), 'src/lib/db/customers.json');

/**
 * Retrieves all customers from the data source, optionally filtered by seller.
 * @param sellerId If provided, filters customers by this seller ID.
 * @returns A promise that resolves to an array of Customer objects.
 */
export async function getAllCustomers(sellerId?: string): Promise<Customer[]> {
  try {
    const fileExists = await fs.pathExists(customersFilePath);
    let allCustomers: Customer[];
    if (!fileExists) {
      await fs.outputJson(customersFilePath, initialCustomers, { spaces: 2 });
      allCustomers = initialCustomers;
    } else {
      const data = await fs.readJson(customersFilePath, { throws: false });
      allCustomers = (data && data.length > 0) ? data : initialCustomers;
      if (!data || data.length === 0) {
        await fs.outputJson(customersFilePath, initialCustomers, { spaces: 2 });
      }
    }
    
    return sellerId ? allCustomers.filter(c => c.sellerId === sellerId) : allCustomers;
  } catch (e) {
    console.error("Could not read or initialize customers file, returning fallback data.", e);
    const allCustomers = initialCustomers;
    return sellerId ? allCustomers.filter(c => c.sellerId === sellerId) : allCustomers;
  }
}

/**
 * Saves the entire list of customers to the data source.
 * @param updatedCustomers - The full array of customers to save.
 */
export async function saveCustomers(updatedCustomers: Customer[]): Promise<void> {
  try {
    await fs.outputJson(customersFilePath, updatedCustomers, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save customers to file.", e);
  }
}
