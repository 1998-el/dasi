export type UserRole = 'admin' | 'manager' | 'waiter' | 'kitchen';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  onboardingStatus?: 'PENDING_PROFILE' | 'AWAITING_OTP' | 'PENDING_ESTABLISHMENT' | 'COMPLETED';
  tenantId?: string;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'cleaning';
  positionX: number;
  positionY: number;
  floorId: string;
}

export interface Floor {
  id: string;
  name: string;
  tables: Table[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  image?: string;
  isAvailable: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  notes?: string;
  status: 'pending' | 'preparing' | 'ready' | 'served';
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: 'draft' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'paid' | 'cancelled';
  total: number;
  createdAt: string;
  updatedAt: string;
  waiterId: string;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'card' | 'mobile';
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface Ticket {
  id: string;
  tableId: string;
  orderId: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
}
