import { api } from "../api/client";
import { AuthSession } from "../types";

export const authService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const { data } = await api.post("/users/login", { email, password });
    return data;
  },

  async register(name: string, email: string, password: string) {
    const { data } = await api.post("/users/register", {
      name,
      email,
      password,
    });
    return data;
  },
};
