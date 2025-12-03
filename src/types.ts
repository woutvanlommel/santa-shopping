export interface Product {
    category: string;
    description: string;
    id: string;
    price: number;
    name: string;
    stock: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string;
}

export interface cartItem {
  product: Product;
  quantity: number;
}