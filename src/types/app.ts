export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export interface Product {
  _id: string;
  productName: string;
  sku: string;
  category: string;
  purchasePrice: number;
  sellingPrice: number;
  stockQuantity: number;
  productImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStockProducts: number;
}

export interface SaleItem {
  product: string | Product;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
}

export interface Sale {
  _id: string;
  items: SaleItem[];
  grandTotal: number;
  soldBy?: AuthUser;
  createdAt: string;
}
