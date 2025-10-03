export type Product = {
  id: string;
  sellerId: string; // To link product to a seller
  name: string;
  description: string;
  pricePerGram: number;
  stockInGrams: number;
  imageUrl: string;
  imageHint?: string | null;
};

export type CartItem = {
  product: Product;
  quantityInGrams: number;
};

export type PurchaseRequestStatus = 'pending' | 'confirmed' | 'rejected';

export type PurchaseRequest = {
  id: string;
  sellerId: string; // To link request to a seller
  customerId: string;
  customerName: string;
  items: CartItem[];
  status: PurchaseRequestStatus;
  total: number;
  createdAt: string;
  confirmationDate?: string;
  sellerNote?: string;
  customerNote?: string;
  isRead?: boolean;
};

export type Customer = {
    id: string;
    name: string;
    username: string;
    password?: string;
};

export type CustomerSellerRelation = {
  customerId: string;
  sellerId: string;
}

export type Seller = {
  id: string;
  username: string; // Used for login, kept private
  storeName: string; // Public-facing name for the shop
  passwordHash: string; // In a real app, this should be a hash
}

export type SessionUser = {
  id: string; // For customers, this is customerId. For admins, it's sellerId.
  name: string;
  username: string;
  role: 'admin' | 'customer';
  sellerId?: string; // Only for admins, to identify their store
};

export type ReferralCode = {
  code: string;
  sellerId: string;
};
