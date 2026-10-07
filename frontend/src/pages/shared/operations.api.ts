import { apiRequest } from '../../api/client';
export type MasterKind = 'companies' | 'business-locations' | 'warehouses';
export type InventoryKind = 'purchase-orders' | 'purchases' | 'stock-transfers';
export type Master = {
  id: number;
  version: number;
  code: string;
  name: string;
  address: string;
  status: string;
  parentId: number | null;
  parentName: string;
  kind: MasterKind;
};
export type MasterInput = {
  code: string;
  name: string;
  address: string;
  status: string;
  parentId: number | null;
  version?: number;
};
export type Stock = {
  id: number;
  version: number;
  productId: number;
  productName: string;
  warehouseId: number;
  warehouseName: string;
  quantity: number;
  status: string;
};
export type ProductChoice = { id: number; name: string };
export type InventoryLine = {
  productId: number;
  quantity: number;
  unitCost: number;
  productName?: string;
};
export type InventoryInput = {
  number: string;
  supplierName: string;
  documentDate: string;
  notes: string;
  warehouseId: number;
  destinationId: number | null;
  purchaseOrderId: number | null;
  version?: number;
  lines: InventoryLine[];
};
export type Inventory = Omit<InventoryInput, 'lines'> & {
  currency: string;
  lines: (InventoryLine & { lineTotal: number })[];
  id: number;
  version: number;
  kind: InventoryKind;
  status: string;
  total: number;
  warehouseName: string;
  destinationName: string;
};
export type Movement = {
  id: number;
  quantity: number;
  reason: string;
  source: string;
  sourceId: number | null;
  occurredAt: string;
};
export const localDate = () => {
  const d = new Date();
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};
function crud<T, I>(path: string) {
  return {
    list: () => apiRequest<T[]>(path),
    get: (id: number) => apiRequest<T>(path + '/' + id),
    create: (input: I) => apiRequest<T>(path, { method: 'POST', body: JSON.stringify(input) }),
    update: (id: number, input: I) =>
      apiRequest<T>(path + '/' + id, { method: 'PUT', body: JSON.stringify(input) }),
    delete: (id: number, version?: number) => {
      if (version === undefined)
        return Promise.reject(new Error('Reload this record before deleting.'));
      return apiRequest<void>(path + '/' + id + '?version=' + version, { method: 'DELETE' });
    },
  };
}
export const masterApis: Record<MasterKind, ReturnType<typeof crud<Master, MasterInput>>> = {
  companies: crud('/companies'),
  'business-locations': crud('/business-locations'),
  warehouses: crud('/warehouses'),
};
export const inventoryApis = {
  'purchase-orders': crud<Inventory, InventoryInput>('/purchase-orders'),
  purchases: crud<Inventory, InventoryInput>('/purchases'),
  'stock-transfers': crud<Inventory, InventoryInput>('/stock-transfers'),
};
export const masterNames: Record<MasterKind, string> = {
  companies: 'Company',
  'business-locations': 'Business location',
  warehouses: 'Warehouse',
};
export const inventoryNames: Record<InventoryKind, string> = {
  'purchase-orders': 'Purchase order',
  purchases: 'Purchase',
  'stock-transfers': 'Stock transfer',
};
export const postInventory = (kind: InventoryKind, id: number, version: number) =>
  apiRequest<Inventory>('/' + kind + '/' + id + '/post?version=' + version, { method: 'POST' });
export const stockApi = {
  list: () => apiRequest<Stock[]>('/stocks'),
  get: (id: number) => apiRequest<Stock>('/stocks/' + id),
  products: () => apiRequest<ProductChoice[]>('/stock-products'),
  movements: (id: number) => apiRequest<Movement[]>('/stocks/' + id + '/movements'),
  adjust: (input: {
    productId: number;
    warehouseId: number;
    quantity: number;
    reason: string;
    version?: number;
  }) => apiRequest<Stock>('/stocks/adjustments', { method: 'POST', body: JSON.stringify(input) }),
};
