import func2url from '../../backend/func2url.json';
import { MenuItem, Order, CartItem } from '@/types/cafe';

const MENU_URL = func2url['cafe-menu'];
const ORDERS_URL = func2url['cafe-orders'];
const STATUS_URL = func2url['cafe-order-status'];

export async function fetchMenu(): Promise<MenuItem[]> {
  const res = await fetch(MENU_URL);
  const data = await res.json();
  return data.items;
}

export async function upsertMenuItem(item: MenuItem): Promise<void> {
  await fetch(MENU_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'upsert', item }),
  });
}

export async function toggleMenuItem(id: string): Promise<void> {
  await fetch(MENU_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'toggle', id }),
  });
}

export async function deleteMenuItem(id: string): Promise<void> {
  await fetch(MENU_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id }),
  });
}

export async function placeOrder(items: CartItem[], total: number): Promise<{ id: string; code: string }> {
  const res = await fetch(ORDERS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ items, total }),
  });
  return res.json();
}

export async function fetchOrders(): Promise<Order[]> {
  const res = await fetch(ORDERS_URL);
  const data = await res.json();
  return data.orders;
}

export async function fetchOrderByCode(code: string): Promise<Order | null> {
  const res = await fetch(`${STATUS_URL}?code=${code}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.order;
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const res = await fetch(`${STATUS_URL}?id=${id}`);
  if (!res.ok) return null;
  const data = await res.json();
  return data.order;
}

export async function updateOrderStatus(id: string, status: Order['status']): Promise<void> {
  await fetch(STATUS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status }),
  });
}
