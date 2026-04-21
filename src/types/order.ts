export type OrderStatus = "deposit" | "shipping" | "completed" | "pending";

export interface Product {
  id: string;
  name: string;
  capacity: string;
  stock: number;
  price: number;
}

export interface SalesOrder {
  id: string;
  customer: string;
  product: string;
  status: OrderStatus;
  amount: number;
  date: string;
  qrCode: string;
}
