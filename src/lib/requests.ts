'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialRequests, customers } from '@/lib/mock-data';


type Customer = {
    id: string;
    name: string;
    referralCode: string; // Every customer is linked to a seller's code
};

const requestsFilePath = path.resolve(process.cwd(), 'src/lib/db/requests.json');

async function initializeRequestsFile() {
  try {
    await fs.ensureDir(path.dirname(requestsFilePath));
    const exists = await fs.pathExists(requestsFilePath);
    if (!exists) {
      await fs.writeJson(requestsFilePath, initialRequests, { spaces: 2 });
    }
  } catch (error) {
    console.error('Failed to initialize requests.json', error);
  }
}

// Call initialization
initializeRequestsFile();

export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
    try {
        await fs.ensureFile(requestsFilePath);
        const data = await fs.readJson(requestsFilePath);
        return data || [];
    } catch (e) {
        console.error("Could not read requests file, returning empty array.", e);
        if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
            await initializeRequestsFile();
            return initialRequests;
        }
        return [];
    }
}

export async function savePurchaseRequests(requests: PurchaseRequest[]): Promise<void> {
    try {
        await fs.writeJson(requestsFilePath, requests, { spaces: 2 });
    } catch (e) {
        console.error("Failed to save requests to file.", e);
    }
}


// Function to update a request (simulates database update)
export async function updateRequest(updatedRequest: PurchaseRequest): Promise<boolean> {
    const requests = await getPurchaseRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        requests[index] = updatedRequest;
        await savePurchaseRequests(requests);
        return true;
    }
    return false;
};

export async function getCustomersByReferralCode(referralCode: string): Promise<Customer[]> {
    // In a real app, this would query a database.
    return Promise.resolve(customers.filter(c => c.referralCode === referralCode));
}
