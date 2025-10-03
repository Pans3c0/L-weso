import type { Product, PurchaseRequest, Customer, Seller } from '@/lib/types';

/**
 * Initial seed data for sellers.
 */
export const initialSellers: Seller[] = [
  { id: 'seller_1', username: 'pacheco', passwordHash: 'c9d10a0' },
  // Add more sellers here in the future
  // { id: 'seller_2', username: 'another_admin', passwordHash: 'somepassword' },
];

/**
 * Initial seed data for products.
 * This data is used to populate the `products.json` file if it doesn't exist.
 */
export const initialProducts: Product[] = [
  {
    id: 'prod_1',
    sellerId: 'seller_1',
    name: 'Apple Jax',
    description: 'Rubio, made in Spain.',
    pricePerGram: 5,
    stockInGrams: 50,
    imageUrl: '/images/appleJax.png',
    imageHint: 'Apple',
    keywords: 'apple, rojo, jax, hash',
  },
  {
    id: 'prod_2',
    sellerId: 'seller_1',
    name: 'Real Marrocino Farm',
    description: 'Made in Marruecos,  moreno.',
    pricePerGram: 5,
    stockInGrams: 40,
    imageUrl: '/images/mfl.png',
    imageHint: 'marroco ',
    keywords: 'hass, cremoso, guacamole, fruta',
  },
];

/**
 * Mock data for customers.
 * In a real application, this would be stored in a database.
 */
export const customers: Customer[] = [
    { id: 'customer_123', sellerId: 'seller_1', name: 'Juan Pérez', username: 'juanperez', referralCode: 'tienda_admin', password: 'password123' },
];

/**
 * Initial seed data for purchase requests.
 * This is used to populate `requests.json` if it's empty.
 */
export const initialRequests: PurchaseRequest[] = [
    // The list is intentionally left empty to start fresh.
];

/**
 * Initial seed data for referral codes.
 */
export const initialReferralCodes = [
    { code: 'REF-INIT1', sellerId: 'seller_1' }
];
