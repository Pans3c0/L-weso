// THIS IS A NEW FILE
'use server';

import { 
    getReferralCodes as libGetCodes,
    addReferralCode,
} from '@/lib/referral-codes';
import { revalidatePath } from 'next/cache';

/**
 * Server Action: Generates a new, unique referral code and saves it.
 * @returns A success object with the new code or an error object.
 */
export async function generateReferralCodeAction(): Promise<{ success: boolean; newCode?: string; error?: string; }> {
    try {
        // Generate a random 6-character alphanumeric code
        const newCode = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        await addReferralCode(newCode);

        // Revalidate the referrals admin page to show the new code
        revalidatePath('/admin/referrals');

        return { success: true, newCode };
    } catch (error) {
        console.error('Failed to generate referral code:', error);
        return { success: false, error: 'No se pudo generar el código en el servidor.' };
    }
}

/**
 * Server Action: Retrieves all currently active referral codes.
 * @returns An array of strings representing the active codes.
 */
export async function getReferralCodes(): Promise<string[]> {
    return libGetCodes();
}
