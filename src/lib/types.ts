export type Product = {
  id: string;
  name: string;
  description: string;
  pricePerGram: number;
  stockInGrams: number;
  imageUrl: string;
  imageHint?: string | null;
  keywords?: string;
};

export type CartItem = {
  product: Product;
  quantityInGrams: number;
};

export type PurchaseRequestStatus = 'pending' | 'confirmed' | 'rejected';

export type PurchaseRequest = {
  id: string;
  customerId: string; // In a real app, this would be linked to a user account
  customerName: string; // For display purposes
  items: CartItem[];
  status: PurchaseRequestStatus;
  total: number;
  createdAt: string;
  confirmationDate?: string;
  sellerNote?: string;
};
