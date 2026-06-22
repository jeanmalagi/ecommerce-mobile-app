import { api } from "../api/client";

export const cartService = {
  async getCart() {
    const { data } = await api.get("/cart");
    return data;
  },

  async addItem(product_id: number, quantity = 1) {
    const { data } = await api.post("/cart", { product_id, quantity });
    return data;
  },

  async updateItem(id: number, quantity: number) {
    const { data } = await api.put(`/cart/${id}`, { quantity });
    return data;
  },

  async removeItem(id: number) {
    const { data } = await api.delete(`/cart/${id}`);
    return data;
  },
};
