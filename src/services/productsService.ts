import { api } from "../api/client";
import { Product } from "../types";

export type ProductImageAttachment = {
  uri: string;
  name: string;
  type: string;
  file?: File;
};

type ProductPayload = {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image_url?: string;
  imageAttachment?: ProductImageAttachment | null;
};

const toFormData = (payload: ProductPayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("price", String(payload.price));
  formData.append("stock", String(payload.stock));
  formData.append("category", payload.category);

  if (payload.image_url) {
    formData.append("image_url", payload.image_url);
  }

  if (payload.imageAttachment) {
    if (payload.imageAttachment.file) {
      formData.append("image", payload.imageAttachment.file);
    } else {
      formData.append("image", {
        uri: payload.imageAttachment.uri,
        name: payload.imageAttachment.name,
        type: payload.imageAttachment.type,
      } as any);
    }
  }

  return formData;
};

export const productsService = {
  async list(): Promise<Product[]> {
    const { data } = await api.get("/products");
    return data;
  },

  async getById(id: number): Promise<Product> {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async create(payload: ProductPayload): Promise<Product> {
    const hasAttachment = Boolean(payload.imageAttachment);

    const { data } = hasAttachment
      ? await api.post("/products", toFormData(payload), {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      : await api.post("/products", {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          category: payload.category,
          image_url: payload.image_url,
        });

    return data;
  },

  async update(id: number, payload: ProductPayload): Promise<Product> {
    const hasAttachment = Boolean(payload.imageAttachment);

    const { data } = hasAttachment
      ? await api.put(`/products/${id}`, toFormData(payload), {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
      : await api.put(`/products/${id}`, {
          name: payload.name,
          description: payload.description,
          price: payload.price,
          stock: payload.stock,
          category: payload.category,
          image_url: payload.image_url,
        });

    return data;
  },

  async remove(id: number): Promise<{ message: string }> {
    const { data } = await api.delete(`/products/${id}`);
    return data;
  },

  async updateStock(id: number, stock: number): Promise<Product> {
    const { data } = await api.patch(`/products/${id}/stock`, { stock });
    return data;
  },
};
