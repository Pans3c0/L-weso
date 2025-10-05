'use server';

import type { Customer, CustomerSellerRelation } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

const dbDirectory = '/app/src/lib/db';
const customersFilePath = path.join(dbDirectory, 'customers.json');
const relationsFilePath = path.join(dbDirectory, 'customer-seller-relations.json');


/**
 * Retrieves all customer-seller relations.
 */
export async function getCustomerSellerRelations(): Promise<CustomerSellerRelation[]> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.ensureFile(relationsFilePath);
    const data = await fs.readJson(relationsFilePath, { throws: false });
    return data || [];
  } catch (e) {
    console.error("Could not read or initialize relations file.", e);
    return [];
  }
}

/**
 * Saves all customer-seller relations.
 */
async function saveCustomerSellerRelations(relations: CustomerSellerRelation[]): Promise<void> {
  await fs.ensureDir(dbDirectory);
  await fs.outputJson(relationsFilePath, relations, { spaces: 2 });
}


/**
 * Retrieves all customers, optionally filtered by seller.
 * @param sellerId If provided, filters customers associated with this seller ID via the relations file.
 * @returns A promise that resolves to an array of Customer objects.
 */
export async function getAllCustomers(sellerId?: string): Promise<Customer[]> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.ensureFile(customersFilePath);
    const allCustomers: Customer[] = await fs.readJson(customersFilePath, { throws: false }) || [];
    
    if (sellerId) {
      const relations = await getCustomerSellerRelations();
      const customerIdsForSeller = relations
        .filter(r => r.sellerId === sellerId)
        .map(r => r.customerId);
      return allCustomers.filter(c => customerIdsForSeller.includes(c.id));
    }

    return allCustomers;
  } catch (e) {
    console.error("Could not read customers file.", e);
    return [];
  }
}

/**
 * Saves the entire list of customers to the data source.
 */
export async function saveCustomers(updatedCustomers: Customer[]): Promise<void> {
  try {
    await fs.ensureDir(dbDirectory);
    await fs.outputJson(customersFilePath, updatedCustomers, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save customers to file.", e);
  }
}


/**
 * Associates a customer with a seller.
 */
export async function associateCustomerWithSeller(customerId: string, sellerId: string): Promise<void> {
    const relations = await getCustomerSellerRelations();
    const relationExists = relations.some(r => r.customerId === customerId && r.sellerId === sellerId);

    if (!relationExists) {
        relations.push({ customerId, sellerId });
        await saveCustomerSellerRelations(relations);
    }
}
