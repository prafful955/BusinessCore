import { inventoryApis, postInventory } from '../shared/operations.api';
export const purchaseApi = {
  ...inventoryApis['purchases'],
  post: (id: number, version: number) => postInventory('purchases', id, version),
};
