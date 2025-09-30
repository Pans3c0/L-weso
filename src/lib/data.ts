import type { Product } from '@/lib/types';
import path from 'path';
import fs from 'fs-extra';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const imageMap = new Map(PlaceHolderImages.map(img => [img.id, img]));

const tomatoesImage = imageMap.get('tomatoes')!;
const avocadosImage = imageMap.get('avocados')!;
const breadImage = imageMap.get('bread')!;
const goatCheeseImage = imageMap.get('goat-cheese')!;
const oliveOilImage = imageMap.get('olive-oil')!;

const initialProducts: Product[] = [
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

const productsFilePath = path.resolve(process.cwd(), 'src/lib/db/products.json');

// Ensure the directory exists
fs.ensureDirSync(path.dirname(productsFilePath));

// Initialize products.json if it doesn't exist
if (!fs.existsSync(productsFilePath)) {
  fs.writeJsonSync(productsFilePath, initialProducts, { spaces: 2 });
}

// In-memory cache for products
let products: Product[] = fs.readJsonSync(productsFilePath);

export function getAllProducts(): Product[] {
  // Re-read from file in development to catch manual changes
  if (process.env.NODE_ENV === 'development') {
    try {
      products = fs.readJsonSync(productsFilePath);
    } catch (e) {
      console.error("Could not read products file, using in-memory cache.", e);
    }
  }
  return products;
}

export function saveProducts(updatedProducts: Product[]): void {
  try {
    fs.writeJsonSync(productsFilePath, updatedProducts, { spaces: 2 });
    // Update in-memory cache
    products = updatedProducts;
  } catch (e) {
    console.error("Failed to save products to file.", e);
  }
}
