'use server';

import type { Customer, CustomerSellerRelation } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

const customersFilePath = path.resolve(process.cwd(), 'src/lib/db/customers.json');
const relationsFilePath = path.resolve(process.cwd(), 'src/lib/db/customer-seller-relations.json');

/**
 * Retrieves all customer-seller relations.
 */
export async function getCustomerSellerRelations(): Promise<CustomerSellerRelation[]> {
  try {
    const fileExists = await fs.pathExists(relationsFilePath);
    if (!fileExists) {
      await fs.outputJson(relationsFilePath, [], { spaces: 2 });
      return [];
    }
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
  await fs.outputJson(relationsFilePath, relations, { spaces: 2 });
}


/**
 * Retrieves all customers, optionally filtered by seller.
 * @param sellerId If provided, filters customers associated with this seller ID via the relations file.
 * @returns A promise that resolves to an array of Customer objects.
 */
export async function getAllCustomers(sellerId?: string): Promise<Customer[]> {
  try {
    const fileExists = await fs.pathExists(customersFilePath);
    if (!fileExists) {
      await fs.outputJson(customersFilePath, [], { spaces: 2 });
      return [];
    }
    
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
