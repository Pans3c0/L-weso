<<<<<<< HEAD
'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialRequests } from '@/lib/mock-data';

// Path to the JSON file acting as the database for purchase requests.
const requestsFilePath = path.resolve(process.cwd(), 'src/lib/db/requests.json');

/**
 * Initializes the requests data file if it doesn't exist.
 * This ensures the application has seed data on its first run.
 */
async function initializeRequestsFile() {
  try {
    const exists = await fs.pathExists(requestsFilePath);
    if (!exists) {
      await fs.outputJson(requestsFilePath, initialRequests, { spaces: 2 });
    }
  } catch (error) {
    console.error('Failed to initialize requests.json', error);
  }
}

/**
 * Retrieves all purchase requests from the data source.
 * @returns A promise that resolves to an array of PurchaseRequest objects.
 */
export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
    try {
        await initializeRequestsFile(); // Ensure file exists before reading
        const data = await fs.readJson(requestsFilePath, { throws: false });
        return data || [];
    } catch (e) {
        console.error("Could not read requests file, returning fallback data.", e);
        return initialRequests;
    }
}

/**
 * Retrieves a single purchase request by its ID.
 * @param requestId - The ID of the request to find.
 * @returns A promise resolving to the PurchaseRequest or null if not found.
 */
export async function getPurchaseRequestById(requestId: string): Promise<PurchaseRequest | null> {
    const requests = await getPurchaseRequests();
    return requests.find(req => req.id === requestId) || null;
}


/**
 * Saves the entire list of purchase requests to the data source.
 * Note: This overwrites the existing file.
 * @param requests - The full array of requests to save.
 * @returns A promise that resolves when the file is written.
 */
export async function savePurchaseRequests(requests: PurchaseRequest[]): Promise<void> {
    try {
        await fs.outputJson(requestsFilePath, requests, { spaces: 2 });
    } catch (e) {
        console.error("Failed to save requests to file.", e);
    }
}


/**
 * Updates a single purchase request in the data source.
 * It finds the request by ID and replaces it with the updated version.
 * @param updatedRequest - The purchase request object with new data.
 * @returns A promise resolving to true if successful, false otherwise.
 */
export async function updateRequest(updatedRequest: PurchaseRequest): Promise<boolean> {
    const requests = await getPurchaseRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        requests[index] = updatedRequest;
        await savePurchaseRequests(requests);
=======
import type { PurchaseRequest } from '@/lib/types';

type Customer = {
    id: string;
    name: string;
};

// Mock customer data
export const customers: Customer[] = [
    { id: 'customer_123', name: 'Juan Pérez' },
    { id: 'customer_456', name: 'Maria García' },
];

// In-memory store for purchase requests (for demonstration purposes)
export let purchaseRequests: PurchaseRequest[] = [
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

// Function to update a request (simulates database update)
export const updateRequest = (updatedRequest: PurchaseRequest) => {
    const index = purchaseRequests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        purchaseRequests[index] = updatedRequest;
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
        return true;
    }
    return false;
};
