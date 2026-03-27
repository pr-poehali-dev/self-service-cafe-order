import { useState } from 'react';
import { MenuItem, CartItem } from '@/types/cafe';
import { CATEGORIES } from '@/data/menuData';
import Icon from '@/components/ui/icon';

interface MenuScreenProps {
  menu: MenuItem[];
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onGoToCart: () => void;
}

export default function MenuScreen({ menu, cart, onAddToCart, onGoToCart }: MenuScreenProps) {
  const [activeCategory, setActiveCategory] = useState('Все');

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const filtered = activeCategory === 'Все'
    ? menu.filter(m => m.available)
    : menu.filter(m => m.category === activeCategory && m.available);

  const getCartQty = (id: string) => {
    const found = cart.find(c => c.item.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-oswald text-2xl font-bold text-white tracking-wide">
              ☕ <span className="text-[#FF6B2B]">КАФЕ</span>ПОИНТ
            </h1>
            <p className="text-xs text-white/40 font-golos mt-0.5">Сделай заказ, мы приготовим</p>
          </div>
          {totalItems > 0 && (
            <button
              onClick={onGoToCart}
              className="flex items-center gap-3 bg-[#FF6B2B] hover:bg-[#e55a1f] text-white px-5 py-3 rounded-2xl font-semibold transition-all duration-200 hover:scale-105 shadow-lg shadow-orange-900/30"
            >
              <Icon name="ShoppingCart" size={18} />
              <span className="font-golos">{totalItems} поз.</span>
              <span className="bg-white/20 px-2 py-0.5 rounded-lg text-sm">{totalPrice} ₽</span>
            </button>
          )}
          {totalItems === 0 && (
            <div className="flex items-center gap-2 text-white/30">
              <Icon name="ShoppingCart" size={20} />
              <span className="text-sm font-golos">Корзина пуста</span>
            </div>
          )}
        </div>
      </header>

      {/* Hero strip */}
      <div className="bg-gradient-to-r from-[#FF6B2B]/20 via-[#FFD93D]/10 to-transparent px-6 py-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <p className="text-white/60 text-sm font-golos">🕐 Среднее время приготовления — <strong className="text-white">15–20 минут</strong></p>
        </div>
      </div>

      {/* Category tabs */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`category-chip whitespace-nowrap font-golos ${
                activeCategory === cat
                  ? 'bg-[#FF6B2B] text-white shadow-lg shadow-orange-900/30'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu grid */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, i) => {
            const qty = getCartQty(item.id);
            return (
              <div
                key={item.id}
                className="menu-card bg-[#1A1A1A] border border-white/5 rounded-2xl overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 0.04}s`, opacity: 0 }}
              >
                {/* Emoji block */}
                <div className="bg-gradient-to-br from-white/5 to-transparent flex items-center justify-center h-28 text-5xl select-none">
                  {item.emoji}
                </div>
                <div className="p-4">
                  <h3 className="font-golos font-semibold text-white text-sm leading-tight">{item.name}</h3>
                  <p className="text-white/40 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <span className="font-oswald text-[#FF6B2B] text-lg font-bold">{item.price} ₽</span>
                    <button
                      onClick={() => onAddToCart(item)}
                      className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 font-bold text-lg ${
                        qty > 0
                          ? 'bg-[#FF6B2B] text-white scale-110'
                          : 'bg-white/10 text-white hover:bg-[#FF6B2B] hover:scale-110'
                      }`}
                    >
                      {qty > 0 ? qty : '+'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Bottom cart bar */}
      {totalItems > 0 && (
        <div className="sticky bottom-0 px-6 py-4 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <button
              onClick={onGoToCart}
              className="w-full bg-[#FF6B2B] hover:bg-[#e55a1f] text-white py-4 rounded-2xl font-oswald text-lg font-semibold tracking-wide transition-all duration-200 hover:scale-[1.02] shadow-xl shadow-orange-900/30 flex items-center justify-center gap-3"
            >
              <Icon name="ShoppingCart" size={22} />
              Корзина · {totalItems} поз. · {totalPrice} ₽
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
