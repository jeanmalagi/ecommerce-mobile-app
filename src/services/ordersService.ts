import { api } from "../api/client";

export const ordersService = {
  async createOrder() {
    const { data } = await api.post("/orders");
    return data;
  },

  async getMyOrders() {
    const { data } = await api.get("/orders");
    return data;
  },

  async getOrderDetails(id: number) {
    const { data } = await api.get(`/orders/${id}`);
    return data;
  },

  async getAllAdminOrders() {
    const { data } = await api.get("/orders/admin/all");
    return data;
  },

  async updateAdminOrderStatus(id: number, status: string) {
    const { data } = await api.put(`/orders/admin/${id}`, { status });
    return data;
  },
};
