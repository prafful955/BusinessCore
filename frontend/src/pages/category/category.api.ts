import { apiRequest } from '../../api/client';
export type CategoryInput = { name: string; description: string; status: string; version?: number };
export type Category = CategoryInput & {
  id: number;
  version: number;
  createdAt: string;
  updatedAt: string;
};
export const categoryApi = {
  list: () => apiRequest<Category[]>('/categories'),
  get: (id: number) => apiRequest<Category>('/categories/' + id),
  create: (input: CategoryInput) =>
    apiRequest<Category>('/categories', { method: 'POST', body: JSON.stringify(input) }),
  update: (id: number, input: CategoryInput) =>
    apiRequest<Category>('/categories/' + id, { method: 'PUT', body: JSON.stringify(input) }),
  delete: (id: number, version?: number) => {
    if (version === undefined)
      return Promise.reject(new Error('Reload the category before deleting it.'));
    return apiRequest<void>('/categories/' + id + '?version=' + version, { method: 'DELETE' });
  },
};
