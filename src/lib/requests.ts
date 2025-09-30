'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

type Customer = {
    id: string;
    name: string;
    referralCode: string; // Every customer is linked to a seller's code
};

// Mock customer data
export const customers: Customer[] = [
    { id: 'customer_123', name: 'Juan Pérez', referralCode: 'tienda_admin' },
    { id: 'customer_456', name: 'Maria García', referralCode: 'tienda_admin' },
];

const requestsFilePath = path.resolve(process.cwd(), 'src/lib/db/requests.json');

// Initial data for requests
const initialRequests: PurchaseRequest[] = [
    {
        id: 'req_1719418800000',
        customerId: 'customer_123',
        customerName: 'Juan Pérez',
        items: [
            {
                product: {
                    id: 'prod_1',
                    name: 'Tomates Frescos',
                    description: 'Tomates jugosos y maduros...',
                    pricePerGram: 0.003,
                    stockInGrams: 25000,
                    imageUrl: 'https://images.unsplash.com/photo-1683008952375-410ae668e6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMHRvbWF0b2VzfGVufDB8fHx8MTc1OTEzNTAyOXww&ixlib=rb-4.1.0&q=80&w=1080',
                    imageHint: 'fresh tomatoes',
                },
                quantityInGrams: 500
            },
            {
                product: {
                    id: 'prod_3',
                    name: 'Pan de Masa Madre',
                    description: 'Pan de fermentación lenta...',
                    pricePerGram: 0.01,
                    stockInGrams: 5000,
                    imageUrl: 'https://images.unsplash.com/photo-1618890512438-19730450f731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhcnRpc2FuYWwlMjBicmVhZHxlbnwwfHx8fDE3NTkyMTI2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
                    imageHint: 'artisanal bread',
                },
                quantityInGrams: 250
            }
        ],
        status: 'pending',
        total: 4.00,
        createdAt: new Date('2024-06-26T10:00:00Z').toISOString(),
    }
];

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
        if (e.code === 'ENOENT') {
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
