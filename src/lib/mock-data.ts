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
    name: 'Tomates Frescos',
    description: 'Tomates jugosos y maduros, perfectos para ensaladas y salsas. Cosechados localmente.',
    pricePerGram: 0.003,
    stockInGrams: 25000,
    imageUrl: tomatoesImage.imageUrl,
    imageHint: tomatoesImage.imageHint,
    keywords: 'tomate, rojo, ensalada, fresco, verdura',
  },
  {
    id: 'prod_2',
    name: 'Aguacates Hass',
    description: 'Aguacates cremosos de la variedad Hass, ideales para guacamole o tostadas.',
    pricePerGram: 0.006,
    stockInGrams: 15000,
    imageUrl: avocadosImage.imageUrl,
    imageHint: avocadosImage.imageHint,
    keywords: 'aguacate, hass, cremoso, guacamole, fruta',
  },
  {
    id: 'prod_3',
    name: 'Pan de Masa Madre',
    description: 'Pan de fermentación lenta con una corteza crujiente y una miga suave y aireada.',
    pricePerGram: 0.01,
    stockInGrams: 5000,
    imageUrl: breadImage.imageUrl,
    imageHint: breadImage.imageHint,
    keywords: 'pan, masa madre, artesanal, panaderia, crujiente',
  },
  {
    id: 'prod_4',
    name: 'Queso de Cabra',
    description: 'Queso de cabra suave y untable, con un sabor ligeramente ácido. Producido en una granja cercana.',
    pricePerGram: 0.025,
    stockInGrams: 8000,
    imageUrl: goatCheeseImage.imageUrl,
    imageHint: goatCheeseImage.imageHint,
    keywords: 'queso, cabra, cremoso, lacteo, granja',
  },
  {
    id: 'prod_5',
    name: 'Aceite de Oliva Extra Virgen',
    description: 'Aceite de oliva de primera prensada en frío, con notas afrutadas y un final picante.',
    pricePerGram: 0.02,
    stockInGrams: 12000,
    imageUrl: oliveOilImage.imageUrl,
    imageHint: oliveOilImage.imageHint,
    keywords: 'aceite, oliva, virgen extra, afrutado, cocina',
  }
];

/**
 * Mock data for customers.
 * In a real application, this would be stored in a database.
 */
export const customers: Customer[] = [
    { id: 'customer_123', name: 'Juan Pérez', username: 'juanperez', referralCode: 'tienda_admin' },
    { id: 'customer_456', name: 'Maria García', username: 'mariagarcia', referralCode: 'tienda_admin' },
];

/**
 * Initial seed data for purchase requests.
 * This is used to populate `requests.json` if it's empty.
 */
export const initialRequests: PurchaseRequest[] = [
    {
        id: 'req_1719418800000',
        customerId: 'customer_123',
        customerName: 'Juan Pérez',
        items: [
            {
                product: initialProducts[0], // Tomates
                quantityInGrams: 500
            },
            {
                product: initialProducts[2], // Pan
                quantityInGrams: 250
            }
        ],
        status: 'pending',
        total: (500 * initialProducts[0].pricePerGram) + (250 * initialProducts[2].pricePerGram),
        createdAt: new Date('2024-06-26T10:00:00Z').toISOString(),
    }
];
