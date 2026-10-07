import { apiRequest } from '../../api/client';

export const dashboardCategories = [
  'Bedding',
  'Appliances',
  'Electronics',
  'Sales',
  'Orders',
  'Deliveries',
  'Collection',
  'Purchase',
] as const;
export type DashboardCategory = (typeof dashboardCategories)[number];
export type DashboardMetric = { key: string; label: string; amount: number };
export type DashboardSummary = { currency: string; updatedAt: string; metrics: DashboardMetric[] };
export const dashboardApi = {
  summary: (zCategoryP: DashboardCategory) =>
    apiRequest<DashboardSummary>(`/dashboard/summary?category=${encodeURIComponent(zCategoryP)}`),
};
