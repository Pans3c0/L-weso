'use server';

import path from 'path';
import fs from 'fs-extra';
import type { Product, PurchaseRequest, Customer, Seller, ReferralCode, CustomerSellerRelation } from '@/lib/types';
import type { PushSubscription } from 'web-push';
import imageCompression from 'browser-image-compression';


const dbDirectory = path.join(process.cwd(), 'src', 'lib', 'db');

const Paths = {
    products: path.join(dbDirectory, 'products.json'),
    requests: path.join(dbDirectory, 'requests.json'),
    customers: path.join(dbDirectory, 'customers.json'),
    sellers: path.join(dbDirectory, 'sellers.json'),
    referralCodes: path.join(dbDirectory, 'referral-codes.json'),
    relations: path.join(dbDirectory, 'customer-seller-relations.json'),
    subscriptions: path.join(dbDirectory, 'subscriptions.json'),
};

// Generic function to read a JSON file
async function readDbFile<T>(filePath: string): Promise<T> {
    try {
        await fs.ensureFile(filePath);
        const data = await fs.readJson(filePath, { throws: false });
        // Provide a default value based on the expected structure (array vs object)
        if (data === null || data === undefined) {
            return filePath.endsWith('subscriptions.json') ? {} as T : [] as T;
        }
        return data;
    } catch (e) {
        console.error(`Could not read file: ${filePath}`, e);
        return filePath.endsWith('subscriptions.json') ? {} as T : [] as T;
    }
}


// Generic function to write a JSON file
async function writeDbFile<T>(filePath: string, data: T): Promise<void> {
    try {
        await fs.outputJson(filePath, data, { spaces: 2 });
    } catch (e) {
        console.error(`Failed to write file: ${filePath}`, e);
    }
}

// Products
export const getAllProducts = async (sellerId?: string) => readDbFile<Product[]>(Paths.products).then(data => sellerId ? data.filter(p => p.sellerId === sellerId) : data);
export const getProductById = async (id: string) => (await getAllProducts()).find(p => p.id === id) || null;

export const saveProduct = async (data: {
    id?: string,
    sellerId: string,
    name: string,
    description: string,
    pricePerGram: number,
    stockInGrams: number,
    imageFile?: File,
    existingImageUrl?: string,
}) => {
    const { imageFile, existingImageUrl, ...productData } = data;
    let newImageUrl: string | undefined = undefined;

    // Handle image upload if a new file is provided
    if (imageFile && imageFile.size > 0) {
        try {
            const uploadDir = path.join(process.cwd(), 'public', 'images');
            await fs.ensureDir(uploadDir);
            
            const fileBuffer = Buffer.from(await imageFile.arrayBuffer());
            const fileExtension = path.extname(imageFile.name) || '.jpg';
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const fileName = `upload-${uniqueSuffix}${fileExtension}`;
            const filePath = path.join(uploadDir, fileName);

            await fs.writeFile(filePath, fileBuffer);
            newImageUrl = `/images/${fileName}`;
            
            if (existingImageUrl && existingImageUrl.startsWith('/images/')) {
                const oldImageName = path.basename(existingImageUrl);
                const oldImagePath = path.join(process.cwd(), 'public', 'images', oldImageName);
                if (await fs.pathExists(oldImagePath)) {
                    await fs.unlink(oldImagePath);
                }
            }
        } catch (uploadError) {
            console.error('Failed to upload image:', uploadError);
            throw new Error('Failed to upload new image.');
        }
    }
    
    const products = await getAllProducts();
    let finalProduct: Product;
    
    const productToSave = {
        ...productData,
        imageUrl: newImageUrl || existingImageUrl || '',
    };

    if (productToSave.id) {
        const index = products.findIndex(p => p.id === productToSave.id);
        if (index === -1) throw new Error("Product not found for update");
        finalProduct = { ...products[index], ...productToSave } as Product;
        products[index] = finalProduct;
    } else {
        finalProduct = { ...productToSave, id: `prod_${Date.now()}` } as Product;
        products.push(finalProduct);
    }
    
    await writeDbFile(Paths.products, products);
    return finalProduct;
};

export const deleteProduct = async (id: string) => {
    const product = await getProductById(id);
    if (product && product.imageUrl && product.imageUrl.startsWith('/images/')) {
        try {
            const imageName = path.basename(product.imageUrl);
            const imagePath = path.join(process.cwd(), 'public', 'images', imageName);
             if (await fs.pathExists(imagePath)) {
                await fs.unlink(imagePath);
            }
        } catch (error) {
             console.error('Failed to delete product image during deletion:', error);
        }
    }
    const products = await getAllProducts();
    await writeDbFile(Paths.products, products.filter(p => p.id !== id));
}

// Purchase Requests
export const getPurchaseRequests = async (sellerId?: string) => readDbFile<PurchaseRequest[]>(Paths.requests).then(data => sellerId ? data.filter(req => req.sellerId === sellerId) : data);
export const getPurchaseRequestById = async (id: string) => (await getPurchaseRequests()).find(r => r.id === id) || null;
export const savePurchaseRequests = async (requests: PurchaseRequest[]) => writeDbFile(Paths.requests, requests);
export const updateRequest = async (updatedRequest: PurchaseRequest) => {
    const requests = await getPurchaseRequests();
    const index = requests.findIndex(req => req.id === updatedRequest.id);
    if (index !== -1) {
        requests[index] = updatedRequest;
        await savePurchaseRequests(requests);
    }
};

// Customers
export const getAllCustomers = async (sellerId?: string): Promise<Customer[]> => {
    const allCustomers = await readDbFile<Customer[]>(Paths.customers);
    if (sellerId) {
        const relations = await getCustomerSellerRelations();
        const customerIds = relations.filter(r => r.sellerId === sellerId).map(r => r.customerId);
        return allCustomers.filter(c => customerIds.includes(c.id));
    }
    return allCustomers;
};
export const getCustomerById = async (id: string) => (await getAllCustomers()).find(c => c.id === id) || null;
export const saveCustomers = async (customers: Customer[]) => writeDbFile(Paths.customers, customers);

// Sellers
export const getAllSellers = async () => readDbFile<Seller[]>(Paths.sellers);
export const saveSellers = async (sellers: Seller[]) => writeDbFile(Paths.sellers, sellers);

// Referral Codes
export const getReferralCodes = async () => readDbFile<ReferralCode[]>(Paths.referralCodes);
export const findReferralCode = async (code: string) => (await getReferralCodes()).find(c => c.code === code) || null;
export const addReferralCode = async (code: ReferralCode) => {
    const codes = await getReferralCodes();
    codes.push(code);
    await writeDbFile(Paths.referralCodes, codes);
};
export const removeReferralCode = async (code: string) => {
    const codes = await getReferralCodes();
    await writeDbFile(Paths.referralCodes, codes.filter(c => c.code !== code));
};

// Customer-Seller Relations
export const getCustomerSellerRelations = async () => readDbFile<CustomerSellerRelation[]>(Paths.relations);
export const associateCustomerWithSeller = async (customerId: string, sellerId: string) => {
    const relations = await getCustomerSellerRelations();
    if (!relations.some(r => r.customerId === customerId && r.sellerId === sellerId)) {
        relations.push({ customerId, sellerId });
        await writeDbFile(Paths.relations, relations);
    }
};

// Subscriptions
export const getSubscriptions = async () => readDbFile<Record<string, PushSubscription>>(Paths.subscriptions);

export const saveSubscription = async (userId: string, subscription: PushSubscription | undefined) => {
    const subscriptions = await getSubscriptions();
    if (subscription) {
        subscriptions[userId] = subscription;
    } else {
        delete subscriptions[userId];
    }
    await writeDbFile(Paths.subscriptions, subscriptions);
};
