import { apiRequest } from '../../api/client';
import type { Employee, EmployeeInput } from './employee.types';

export const employeeApi = {
  list: () => apiRequest<Employee[]>('/employees'),
  get: (nEmployeeIdP: number) => apiRequest<Employee>(`/employees/${nEmployeeIdP}`),
  create: (oEmployeeP: EmployeeInput) => apiRequest<Employee>('/employees', { method: 'POST', body: JSON.stringify(oEmployeeP) }),
  update: (nEmployeeIdP: number, oEmployeeP: EmployeeInput) => apiRequest<Employee>(`/employees/${nEmployeeIdP}`, { method: 'PUT', body: JSON.stringify(oEmployeeP) }),
  delete: (nEmployeeIdP: number) => apiRequest<void>(`/employees/${nEmployeeIdP}`, { method: 'DELETE' }),
};
