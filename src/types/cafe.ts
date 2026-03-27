export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  emoji: string;
  available: boolean;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  status: 'new' | 'cooking' | 'ready' | 'done';
  createdAt: Date;
  tableNumber?: number;
}

export type Screen = 'menu' | 'cart' | 'status' | 'kitchen' | 'kitchen-login' | 'kitchen-menu';
