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
<<<<<<< HEAD
  customerNote?: string; // For delay notifications
  isRead?: boolean; // For client-side notification tracking
};

export type Customer = {
    id: string;
    name: string;
    username: string;
    referralCode: string; // Every customer is linked to a seller's code
    password?: string; // Storing password locally (for simulation)
};

export type SessionUser = {
  id: string;
  name: string;
  username: string;
  role: 'admin' | 'customer';
=======
>>>>>>> 0c19ed0 (Quiero que se le envie una notificacion al vendedor para que cuando se q)
};
