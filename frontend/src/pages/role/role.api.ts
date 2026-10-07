import { apiRequest } from '../../api/client';
import type { Role, RoleInput } from './role.types';

export const roleApi = {
  delete: (nRoleIdP: number) => apiRequest<void>(`/roles/${nRoleIdP}`, { method: 'DELETE' }),
  list: () => apiRequest<Role[]>('/roles'),
  get: (nRoleIdP: number) => apiRequest<Role>(`/roles/${nRoleIdP}`),
  create: (oRoleP: RoleInput) => apiRequest<Role>('/roles', { method: 'POST', body: JSON.stringify(oRoleP) }),
  update: (nRoleIdP: number, oRoleP: RoleInput) => apiRequest<Role>(`/roles/${nRoleIdP}`, { method: 'PUT', body: JSON.stringify(oRoleP) }),
};
