'use server';

import { 
    addReferralCode,
    findReferralCode,
    removeReferralCode,
} from '@/lib/referral-codes';
import type { ReferralCode } from '@/lib/types';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { associateCustomerWithSeller, getCustomerSellerRelations } from '@/lib/customers';

const GenerateCodeSchema = z.object({
    sellerId: z.string().min(1, "Seller ID is required"),
});

/**
 * Server Action: Generates a new, unique referral code for a specific seller.
 * @returns A success object with the new code or an error object.
 */
export async function generateReferralCodeAction(input: { sellerId: string }): Promise<{ success: boolean; newCode?: string; error?: string; }> {
    const parsedInput = GenerateCodeSchema.safeParse(input);
    if (!parsedInput.success) {
        return { success: false, error: "Invalid input" };
    }
    const { sellerId } = parsedInput.data;

    try {
        // Generate a random 6-character alphanumeric code
        const newCodeString = `REF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newCode: ReferralCode = {
            code: newCodeString,
            sellerId: sellerId,
        };

        await addReferralCode(newCode);

        // Revalidate the referrals admin page to show the new code
        revalidatePath('/admin/referrals');

        return { success: true, newCode: newCodeString };
    } catch (error) {
        console.error('Failed to generate referral code:', error);
        return { success: false, error: 'No se pudo generar el código en el servidor.' };
    }
}

/**
 * Server Action: Retrieves all referral codes for a specific seller.
 * @param sellerId The ID of the seller whose codes to retrieve.
 * @returns An array of strings representing the active codes for that seller.
 */
export async function getReferralCodesForSeller(sellerId: string): Promise<string[]> {
    // This function is now used only for the admin display, so it just returns the codes.
    // The logic to find a code's owner is handled by findReferralCode.
    const relations = await getCustomerSellerRelations();
    // This is not correct logic. We should get referral codes from the referral codes file.
    // Let's call getReferralCodes instead
    const { getReferralCodes } = await import('@/lib/referral-codes');
    const allCodes = await getReferralCodes();
    return allCodes
        .filter(c => c.sellerId === sellerId)
        .map(c => c.code);
}


const AssociateCodeSchema = z.object({
    customerId: z.string().min(1, "Customer ID is required"),
    referralCode: z.string().min(1, "Referral code is required"),
});
/**
 * Server Action: Associates an existing customer with a new seller using a referral code.
 */
export async function associateCustomerWithSellerAction(input: z.infer<typeof AssociateCodeSchema>) {
    const parsedInput = AssociateCodeSchema.safeParse(input);
    if (!parsedInput.success) {
        return { success: false, error: "Invalid input" };
    }
    const { customerId, referralCode } = parsedInput.data;

    try {
        const codeDetails = await findReferralCode(referralCode);
        if (!codeDetails) {
            return { success: false, error: "El código de referencia no es válido o ya ha sido utilizado." };
        }

        await associateCustomerWithSeller(customerId, codeDetails.sellerId);
        await removeReferralCode(referralCode);
        
        revalidatePath('/shop'); // Revalidate shop page to update seller list for customer

        return { success: true, newSellerId: codeDetails.sellerId };

    } catch (error) {
        console.error('Failed to associate customer with seller:', error);
        return { success: false, error: 'No se pudo asociar la cuenta con la nueva tienda.' };
    }
}
