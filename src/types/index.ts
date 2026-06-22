export type User = {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type Product = {
  id: number;
  name: string;
  description: string;
  price: number | string;
  stock: number;
  category: string;
  image_url?: string | null;
};

export type CartItem = {
  id: number;
  product_id: number;
  quantity: number;
  name?: string;
  product_name?: string;
  price?: number | string;
  product_price?: number | string;
  image_url?: string | null;
};
