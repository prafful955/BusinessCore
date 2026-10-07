import { inventoryApis, postInventory } from '../shared/operations.api';
export const stockTransferApi = {
  ...inventoryApis['stock-transfers'],
  post: (id: number, version: number) => postInventory('stock-transfers', id, version),
};
