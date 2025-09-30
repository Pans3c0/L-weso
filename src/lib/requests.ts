import type { PurchaseRequest } from '@/lib/types';

type Customer = {
    id: string;
    name: string;
};

// Mock customer data
export const customers: Customer[] = [
    { id: 'customer_123', name: 'Juan Pérez' },
    { id: 'customer_456', name: 'Maria García' },
];

// In-memory store for purchase requests (for demonstration purposes)
export let purchaseRequests: PurchaseRequest[] = [
    {
        id: 'req_1719418800000',
        customerId: 'customer_123',
        customerName: 'Juan Pérez',
        items: [
            {
                product: {
                    id: 'prod_1',
                    name: 'Tomates Frescos',
                    description: 'Tomates jugosos y maduros...',
                    pricePerGram: 0.003,
                    stockInGrams: 25000,
                    imageUrl: 'https://images.unsplash.com/photo-1683008952375-410ae668e6b9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwyfHxmcmVzaCUyMHRvbWF0b2VzfGVufDB8fHx8MTc1OTEzNTAyOXww&ixlib=rb-4.1.0&q=80&w=1080',
                    imageHint: 'fresh tomatoes',
                },
                quantityInGrams: 500
            },
            {
                product: {
                    id: 'prod_3',
                    name: 'Pan de Masa Madre',
                    description: 'Pan de fermentación lenta...',
                    pricePerGram: 0.01,
                    stockInGrams: 5000,
                    imageUrl: 'https://images.unsplash.com/photo-1618890512438-19730450f731?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw5fHxhcnRpc2FuYWwlMjBicmVhZHxlbnwwfHx8fDE3NTkyMTI2MTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
                    imageHint: 'artisanal bread',
                },
                quantityInGrams: 250
            }
        ],
        status: 'pending',
        total: 4.00,
        createdAt: new Date('2024-06-26T10:00:00Z').toISOString(),
    }
];

// Function to update a request (simulates database update)
export const updateRequest = (updatedRequest: PurchaseRequest) => {
    const index = purchaseRequests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        purchaseRequests[index] = updatedRequest;
        return true;
    }
    return false;
};
