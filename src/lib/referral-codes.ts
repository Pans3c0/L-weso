// THIS IS A NEW FILE
'use server';

import path from 'path';
import fs from 'fs-extra';

const codesFilePath = path.resolve(process.cwd(), 'src/lib/db/referral-codes.json');

/**
 * Ensures the referral codes file exists.
 */
async function initializeFile() {
  try {
    const exists = await fs.pathExists(codesFilePath);
    if (!exists) {
      // Create with an initial placeholder code if it doesn't exist
      await fs.outputJson(codesFilePath, ['REF-INIT1'], { spaces: 2 });
    }
  } catch (error) {
    console.error('Failed to initialize referral-codes.json', error);
  }
}

/**
 * Retrieves all active referral codes.
 * @returns A promise that resolves to an array of code strings.
 */
export async function getReferralCodes(): Promise<string[]> {
  try {
    await initializeFile();
    const data = await fs.readJson(codesFilePath, { throws: false });
    return data || [];
  } catch (e) {
    console.error("Could not read referral codes file.", e);
    return [];
  }
}

/**
 * Saves the entire list of codes.
 * @param codes - The full array of codes to save.
 */
async function saveReferralCodes(codes: string[]): Promise<void> {
  try {
    await fs.outputJson(codesFilePath, codes, { spaces: 2 });
  } catch (e) {
    console.error("Failed to save referral codes.", e);
  }
}

/**
 * Adds a new referral code to the list.
 * @param newCode - The code to add.
 */
export async function addReferralCode(newCode: string): Promise<void> {
  const codes = await getReferralCodes();
  if (!codes.includes(newCode)) {
    codes.push(newCode);
    await saveReferralCodes(codes);
  }
}

/**
 * Removes a referral code from the list, typically after it has been used.
 * @param codeToRemove - The code to remove.
 */
export async function removeReferralCode(codeToRemove: string): Promise<void> {
  const codes = await getReferralCodes();
  const updatedCodes = codes.filter(code => code !== codeToRemove);
  await saveReferralCodes(updatedCodes);
}

/**
 * Checks if a referral code is valid.
 * @param codeToCheck - The code to validate.
 * @returns A promise resolving to true if the code is valid, false otherwise.
 */
export async function isValidReferralCode(codeToCheck: string): Promise<boolean> {
    const codes = await getReferralCodes();
    return codes.includes(codeToCheck);
}
