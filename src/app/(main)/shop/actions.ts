// THIS IS A NEW FILE
'use server';

import { getAllSellers } from '@/lib/sellers';
import { getCustomerSellerRelations } from '@/lib/customers';

export async function getSellersAction() {
  return await getAllSellers();
}

export async function getCustomerSellerRelationsAction() {
  return await getCustomerSellerRelations();
}
