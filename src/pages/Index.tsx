import { useState, useCallback, useEffect } from 'react';
import { MenuItem, CartItem, Order, Screen } from '@/types/cafe';
import { KITCHEN_PASSWORD } from '@/data/menuData';
import * as api from '@/api/cafe';
import MenuScreen from '@/components/cafe/MenuScreen';
import CartScreen from '@/components/cafe/CartScreen';
import StatusScreen from '@/components/cafe/StatusScreen';
import KitchenLogin from '@/components/cafe/KitchenLogin';
import KitchenScreen from '@/components/cafe/KitchenScreen';
import KitchenMenuScreen from '@/components/cafe/KitchenMenuScreen';
import Icon from '@/components/ui/icon';

export default function Index() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [kitchenAuth, setKitchenAuth] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    api.fetchMenu().then(items => {
      setMenu(items);
      setMenuLoading(false);
    }).catch(() => setMenuLoading(false));
  }, []);

  useEffect(() => {
    if (!kitchenAuth) return;
    const load = () => api.fetchOrders().then(setOrders).catch(() => {});
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, [kitchenAuth]);

  const addToCart = useCallback((item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) return prev.map(c => c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((id: string) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === id);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter(c => c.item.id !== id);
      return prev.map(c => c.item.id === id ? { ...c, quantity: c.quantity - 1 } : c);
    });
  }, []);

  const addOneToCart = useCallback((id: string) => {
    setCart(prev => prev.map(c => c.item.id === id ? { ...c, quantity: c.quantity + 1 } : c));
  }, []);

  const handlePlaceOrder = useCallback(async () => {
    if (cart.length === 0 || placingOrder) return;
    setPlacingOrder(true);
    try {
      const total = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);
      const { id, code } = await api.placeOrder(cart, total);
      const order: Order = {
        id,
        code,
        items: [...cart],
        total,
        status: 'new',
        createdAt: new Date(),
      };
      setCurrentOrder(order);
      setCart([]);
      setScreen('status');
    } finally {
      setPlacingOrder(false);
    }
  }, [cart, placingOrder]);

  const refreshCurrentOrder = useCallback(async () => {
    if (!currentOrder) return;
    const updated = await api.fetchOrderById(currentOrder.id);
    if (updated) setCurrentOrder(updated);
  }, [currentOrder]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    await api.updateOrderStatus(orderId, status);
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const handleKitchenLogin = useCallback((password: string): boolean => {
    if (password === KITCHEN_PASSWORD) {
      setKitchenAuth(true);
      setScreen('kitchen');
      return true;
    }
    return false;
  }, []);

  const handleKitchenLogout = useCallback(() => {
    setKitchenAuth(false);
    setScreen('menu');
  }, []);

  const handleGoToKitchen = useCallback(() => {
    if (kitchenAuth) setScreen('kitchen');
    else setScreen('kitchen-login');
  }, [kitchenAuth]);

  const handleMenuUpdate = useCallback(async (
    newMenu: MenuItem[],
    changedItem?: MenuItem,
    action?: 'upsert' | 'toggle' | 'delete'
  ) => {
    setMenu(newMenu);
    if (changedItem && action === 'upsert') await api.upsertMenuItem(changedItem);
    if (changedItem && action === 'toggle') await api.toggleMenuItem(changedItem.id);
    if (changedItem && action === 'delete') await api.deleteMenuItem(changedItem.id);
  }, []);

  if (screen === 'menu') {
    return (
      <div className="relative">
        {menuLoading && (
          <div className="fixed inset-0 bg-[#0D0D0D] z-50 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4 animate-pulse">☕</div>
              <p className="text-white/40 font-golos">Загружаем меню...</p>
            </div>
          </div>
        )}
        <MenuScreen
          menu={menu}
          cart={cart}
          onAddToCart={addToCart}
          onGoToCart={() => setScreen('cart')}
        />
        <button
          onClick={handleGoToKitchen}
          className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-[#1A1A1A] hover:bg-[#2A2A2A] border border-white/10 text-white/40 hover:text-white/70 px-4 py-3 rounded-2xl text-xs font-golos transition-all duration-200 group"
        >
          <Icon name="ChefHat" size={16} className="text-white/30 group-hover:text-[#FF6B2B] transition-colors" />
          Панель кухни
        </button>
        {currentOrder && (
          <button
            onClick={() => setScreen('status')}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-[#1A1A1A] border border-white/10 text-white/60 hover:text-white px-4 py-3 rounded-2xl text-xs font-golos transition-all duration-200"
          >
            <span className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-pulse"></span>
            Заказ #{currentOrder.code}
          </button>
        )}
      </div>
    );
  }

  if (screen === 'cart') {
    return (
      <CartScreen
        cart={cart}
        lastOrder={currentOrder}
        onBack={() => setScreen('menu')}
        onRemove={removeFromCart}
        onAdd={addOneToCart}
        onPlaceOrder={handlePlaceOrder}
        placing={placingOrder}
      />
    );
  }

  if (screen === 'status' && currentOrder) {
    return (
      <StatusScreen
        order={currentOrder}
        onNewOrder={() => { setCurrentOrder(null); setScreen('menu'); }}
        onRefresh={refreshCurrentOrder}
      />
    );
  }

  if (screen === 'kitchen-login') {
    return <KitchenLogin onLogin={handleKitchenLogin} onBack={() => setScreen('menu')} />;
  }

  if (screen === 'kitchen' && kitchenAuth) {
    return (
      <KitchenScreen
        orders={orders}
        onUpdateStatus={updateOrderStatus}
        onGoToMenu={() => setScreen('kitchen-menu')}
        onLogout={handleKitchenLogout}
      />
    );
  }

  if (screen === 'kitchen-menu' && kitchenAuth) {
    return (
      <KitchenMenuScreen
        menu={menu}
        onUpdate={handleMenuUpdate}
        onBack={() => setScreen('kitchen')}
      />
    );
  }

  return null;
}
