'use server';

import type { Customer } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { customers as initialCustomers } from '@/lib/mock-data';

// Path to the JSON file acting as the database for customers.
const customersFilePath = path.resolve(process.cwd(), 'src/lib/db/customers.json');

/**
 * Initializes the customers data file if it doesn't exist.
 */
async function initializeCustomersFile() {
  try {
    const exists = await fs.pathExists(customersFilePath);
    if (!exists) {
      await fs.outputJson(customersFilePath, initialCustomers, { spaces: 2 });
    }
  } catch (error) {
    console.error('Failed to initialize customers.json', error);
  }
}

/**
 * Retrieves all customers from the data source.
 * @returns A promise that resolves to an array of Customer objects.
 */
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    await initializeCustomersFile(); // Ensure file exists before reading
    const data = await fs.readJson(customersFilePath, { throws: false });
    return data || [];
  } catch (e) {
    console.error("Could not read customers file, returning initial data.", e);
    return initialCustomers;
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

/**
 * Finds customers associated with a specific referral code.
 * In a real app, this would query a database.
 * @param referralCode - The seller's referral code to filter customers by.
 * @returns A promise resolving to an array of Customer objects.
 */
export async function getCustomersByReferralCode(referralCode: string) {
    const customers = await getAllCustomers();
    return customers.filter(c => c.referralCode === referralCode);
}
