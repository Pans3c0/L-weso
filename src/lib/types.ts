export type Product = {
  id: string;
  name: string;
  description: string;
  pricePerGram: number;
  stockInGrams: number;
  imageUrl: string;
  imageHint: string;
  keywords?: string;
};

export type CartItem = {
  product: Product;
  quantityInGrams: number;
};
