import { inventoryApis, postInventory } from '../shared/operations.api';
export const purchaseOrderApi = {
  ...inventoryApis['purchase-orders'],
  post: (id: number, version: number) => postInventory('purchase-orders', id, version),
};
