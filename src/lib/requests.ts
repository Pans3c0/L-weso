'use server';

import type { PurchaseRequest } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { initialRequests } from '@/lib/mock-data';

const requestsFilePath = path.resolve(process.cwd(), 'src/lib/db/requests.json');

/**
 * Retrieves all purchase requests from the data source.
 * @returns A promise that resolves to an array of PurchaseRequest objects.
 */
export async function getPurchaseRequests(): Promise<PurchaseRequest[]> {
    try {
        await fs.ensureFile(requestsFilePath)
        const data = await fs.readJson(requestsFilePath, { throws: false });
        if (!data) {
             await fs.outputJson(requestsFilePath, initialRequests, { spaces: 2 });
             return initialRequests;
        }
        return data;
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
        return true;
    }
    return false;
}
