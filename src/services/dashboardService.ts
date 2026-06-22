import { api } from "../api/client";

export type DashboardOrder = {
  id: number;
  total: number | string;
  user_name?: string | null;
};

export type DashboardProduct = {
  id: number;
  name: string;
  stock: number;
};

export type DashboardData = {
  totalSales: number | string;
  totalOrders: number | string;
  totalUsers: number | string;
  lowStock: number | string;
  recentOrders: DashboardOrder[];
  criticalProducts: DashboardProduct[];
};

export const dashboardService = {
  async getDashboard() {
    const { data } = await api.get<DashboardData>("/dashboard");
    return data;
  },
};