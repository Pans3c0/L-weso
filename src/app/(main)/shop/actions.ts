'use server';

import { getCustomerSellerRelations } from "@/lib/customers";
import { getAllSellers } from "@/lib/sellers";
import type { CustomerSellerRelation, Seller } from "@/lib/types";

export async function getSellersAction(): Promise<Seller[]> {
    return await getAllSellers();
}

export async function getCustomerSellerRelationsAction(): Promise<CustomerSellerRelation[]> {
    return await getCustomerSellerRelations();
}
