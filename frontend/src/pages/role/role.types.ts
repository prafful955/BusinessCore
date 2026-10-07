export const permissionModules = [
  { key: 'dashboards', label: 'Dashboards' }, { key: 'locations', label: 'Locations' },
  { key: 'employees', label: 'Employees' }, { key: 'roles', label: 'User Roles' },
  { key: 'products', label: 'Products' }, { key: 'customers', label: 'Customers' },
  { key: 'quotations', label: 'Quotations' }, { key: 'orders', label: 'Orders' },
  { key: 'sales', label: 'Sales' }, { key: 'purchases', label: 'Purchases' },
  { key: 'inventory', label: 'Inventory' }, { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'deliveries', label: 'Deliveries' }, { key: 'finance', label: 'Finance Books' },
  { key: 'appointments', label: 'Appointments' }, { key: 'tasks', label: 'Tasks' },
  { key: 'system', label: 'System' }, { key: 'settings', label: 'Settings' },
] as const;
export const permissionActions = ['view', 'create', 'update', 'delete'] as const;
export type Permission = `${typeof permissionModules[number]['key']}.${typeof permissionActions[number]}`;
export const allPermissions: Permission[] = permissionModules.flatMap(module => permissionActions.map(action => `${module.key}.${action}` as Permission));
export type RoleInput = { name: string; permissions: Permission[] };
export type Role = RoleInput & { id: number };
