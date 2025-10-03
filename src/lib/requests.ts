'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
<<<<<<< HEAD
import { initialRequests } from '@/lib/mock-data';
=======
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)

const requestsFilePath = path.resolve(process.cwd(), 'src/lib/db/requests.json');

/**
 * Retrieves purchase requests, optionally filtered by seller.
 * @param sellerId - If provided, only returns requests for that seller.
 * @returns A promise that resolves to an array of PurchaseRequest objects.
 */
export async function getPurchaseRequests(sellerId?: string): Promise<PurchaseRequest[]> {
    try {
        const fileExists = await fs.pathExists(requestsFilePath);
        let allRequests: PurchaseRequest[];

<<<<<<< HEAD
        if (!fileExists) {
            await fs.outputJson(requestsFilePath, initialRequests, { spaces: 2 });
            allRequests = initialRequests;
        } else {
            const data = await fs.readJson(requestsFilePath, { throws: false });
            allRequests = (data && data.length > 0) ? data : initialRequests;
            if (!data || data.length === 0) {
                 await fs.outputJson(requestsFilePath, initialRequests, { spaces: 2 });
=======
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
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)
            }
        }
        
        return sellerId ? allRequests.filter(req => req.sellerId === sellerId) : allRequests;
    } catch (e) {
        console.error("Could not read or initialize requests file, returning fallback data.", e);
        const allRequests = initialRequests;
        return sellerId ? allRequests.filter(req => req.sellerId === sellerId) : allRequests;
    }
}

<<<<<<< HEAD
/**
 * Retrieves a single purchase request by its ID.
 * @param requestId - The ID of the request to find.
 * @returns A promise resolving to the PurchaseRequest or null if not found.
 */
export async function getPurchaseRequestById(requestId: string): Promise<PurchaseRequest | null> {
    const requests = await getPurchaseRequests(); // Fetches all requests
    return requests.find(req => req.id === requestId) || null;
}


/**
 * Saves the entire list of purchase requests to the data source.
 * @param requests - The full array of requests to save.
 */
export async function savePurchaseRequests(requests: PurchaseRequest[]): Promise<void> {
    try {
        await fs.outputJson(requestsFilePath, requests, { spaces: 2 });
=======
// Ensure the directory exists
fs.ensureDirSync(path.dirname(requestsFilePath));

// Initialize requests.json if it doesn't exist
if (!fs.existsSync(requestsFilePath)) {
    fs.writeJsonSync(requestsFilePath, initialRequests, { spaces: 2 });
}


export function getPurchaseRequests(): PurchaseRequest[] {
    try {
        return fs.readJsonSync(requestsFilePath);
    } catch (e) {
        console.error("Could not read requests file, returning empty array.", e);
        return [];
    }
}

export function savePurchaseRequests(requests: PurchaseRequest[]): void {
    try {
        fs.writeJsonSync(requestsFilePath, requests, { spaces: 2 });
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)
    } catch (e) {
        console.error("Failed to save requests to file.", e);
    }
}


<<<<<<< HEAD
/**
 * Updates a single purchase request in the data source.
 * @param updatedRequest - The purchase request object with new data.
 * @returns A promise resolving to true if successful, false otherwise.
 */
export async function updateRequest(updatedRequest: PurchaseRequest): Promise<boolean> {
    const requests = await getPurchaseRequests(); // Fetches all requests
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        requests[index] = updatedRequest;
        await savePurchaseRequests(requests);
=======
// Function to update a request (simulates database update)
export const updateRequest = (updatedRequest: PurchaseRequest): boolean => {
    const requests = getPurchaseRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        requests[index] = updatedRequest;
        savePurchaseRequests(requests);
>>>>>>> e4739d1 (La app me esta dando problemas durante su uso, ayudame a resolverlas. Te)
        return true;
    }
    return false;
}
