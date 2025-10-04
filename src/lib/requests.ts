'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';

const requestsFilePath = path.join('/', 'app', 'src', 'lib', 'db', 'requests.json');

/**
 * Retrieves purchase requests, optionally filtered by seller.
 * @param sellerId - If provided, only returns requests for that seller.
 * @returns A promise that resolves to an array of PurchaseRequest objects.
 */
export async function getPurchaseRequests(sellerId?: string): Promise<PurchaseRequest[]> {
    try {
        await fs.ensureFile(requestsFilePath);
        const allRequests: PurchaseRequest[] = await fs.readJson(requestsFilePath, { throws: false }) || [];
        
        return sellerId ? allRequests.filter(req => req.sellerId === sellerId) : allRequests;
    } catch (e) {
        console.error("Could not read or initialize requests file.", e);
        return [];
    }
}

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
    } catch (e) {
        console.error("Failed to save requests to file.", e);
    }
}


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
        return true;
    }
    return false;
}
