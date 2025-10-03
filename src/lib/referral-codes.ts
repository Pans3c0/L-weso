'use server';

import path from 'path';
import fs from 'fs-extra';
import type { ReferralCode } from './types';
import { initialReferralCodes } from './mock-data';

const codesFilePath = path.resolve(process.cwd(), 'src/lib/db/referral-codes.json');

/**
 * Retrieves all active referral codes.
 * If the file doesn't exist or is empty, it's initialized with a placeholder.
 * @returns A promise that resolves to an array of ReferralCode objects.
 */
export async function getReferralCodes(): Promise<ReferralCode[]> {
  try {
    const fileExists = await fs.pathExists(codesFilePath);
    if (!fileExists) {
        await fs.outputJson(codesFilePath, initialReferralCodes, { spaces: 2 });
        return initialReferralCodes;
    }
    const data = await fs.readJson(codesFilePath, { throws: false });
    if (!data || data.length === 0) {
      await fs.outputJson(codesFilePath, initialReferralCodes, { spaces: 2 });
      return initialReferralCodes;
    }
    return data;
  } catch (e) {
    console.error("Could not read or initialize referral codes file.", e);
    return [];
  }
}

/**
 * Saves the entire list of codes.
 * @param codes - The full array of ReferralCode objects to save.
 */
async function saveReferralCodes(codes: ReferralCode[]): Promise<void> {
  try {
    await fs.outputJson(codesFilePath, codes, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save referral codes.", e);
  }
}

/**
 * Adds a new referral code to the list.
 * @param newCode - The ReferralCode object to add.
 */
export async function addReferralCode(newCode: ReferralCode): Promise<void> {
  const codes = await getReferralCodes();
  if (!codes.find(c => c.code === newCode.code)) {
    codes.push(newCode);
    await saveReferralCodes(codes);
  }
}

/**
 * Removes a referral code from the list, typically after it has been used.
 * @param codeToRemove - The string code to remove.
 */
export async function removeReferralCode(codeToRemove: string): Promise<void> {
  const codes = await getReferralCodes();
  const updatedCodes = codes.filter(c => c.code !== codeToRemove);
  await saveReferralCodes(updatedCodes);
}

/**
 * Finds a referral code and returns its details.
 * @param codeToCheck - The string code to find.
 * @returns A promise resolving to the ReferralCode object or null if not found.
 */
export async function findReferralCode(codeToCheck: string): Promise<ReferralCode | null> {
    const codes = await getReferralCodes();
    return codes.find(c => c.code === codeToCheck) || null;
}
