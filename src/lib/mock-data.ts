
import type { Product, PurchaseRequest, Customer } from '@/lib/types';
import { placeholderImages } from '@/lib/placeholder-images';

// A simple map to easily access placeholder images by their ID.
const imageMap = new Map(placeholderImages.map(img => [img.id, img]));

const tomatoesImage = imageMap.get('tomatoes')!;
const avocadosImage = imageMap.get('avocados')!;
const breadImage = imageMap.get('bread')!;
const goatCheeseImage = imageMap.get('goat-cheese')!;
const oliveOilImage = imageMap.get('olive-oil')!;

/**
 * Initial seed data for products.
 * This data is used to populate the `products.json` file if it doesn't exist.
 */
export const initialProducts: Product[] = [
  {
    id: 'prod_1',
    name: 'Lemon Fresh',
    description: 'Polen tierno, made in Spain.',
    pricePerGram: 5,
    stockInGrams: 25000,
    imageUrl: tomatoesImage.imageUrl,
    imageHint: tomatoesImage.imageHint,
    keywords: 'tomate, rojo, ensalada, fresco, verdura',
  },
  {
    id: 'prod_2',
    name: 'Horse Power',
    description: 'Made in France, Tierno y buen tufo.',
    pricePerGram: 6.5,
    stockInGrams: 15000,
    imageUrl: avocadosImage.imageUrl,
    imageHint: avocadosImage.imageHint,
    keywords: 'aguacate, hass, cremoso, guacamole, fruta',
  },
  {
    id: 'prod_3',
    name: 'CR7',
    description: 'Comer decente.',
    pricePerGram: 3.5,
    stockInGrams: 5000,
    imageUrl: breadImage.imageUrl,
    imageHint: breadImage.imageHint,
    keywords: 'pan, masa madre, artesanal, panaderia, crujiente',
  },
  {
    id: 'prod_1759228772828',
    name: 'Ferrari',
    description: 'Polen rubio de alta calidad.',
    pricePerGram: 4.7,
    stockInGrams: 10000,
    imageUrl: oliveOilImage.imageUrl,
    imageHint: 'olive oil',
    keywords: 'Polen, rubio'
  }
];

/**
 * Mock data for customers.
 * In a real application, this would be stored in a database.
 */
export const customers: Customer[] = [
    { id: 'customer_123', name: 'Juan Pérez', username: 'juanperez', referralCode: 'tienda_admin', password: 'password123' },
    { id: 'customer_456', name: 'Maria García', username: 'mariagarcia', referralCode: 'tienda_admin', password: 'password' },
];

/**
 * Initial seed data for purchase requests.
 * This is used to populate `requests.json` if it's empty.
 */
export const initialRequests: PurchaseRequest[] = [
    // The list is intentionally left empty to start fresh.
];
