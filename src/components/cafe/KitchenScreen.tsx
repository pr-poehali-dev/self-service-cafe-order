import { useEffect, useRef, useState } from 'react';
import { Order } from '@/types/cafe';
import Icon from '@/components/ui/icon';

interface KitchenScreenProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onGoToMenu: () => void;
  onLogout: () => void;
}

const STATUS_CONFIG = {
  new: { label: 'Новый', color: 'text-[#FFD93D]', bg: 'bg-[#FFD93D]/10', border: 'border-[#FFD93D]/30', dot: 'bg-[#FFD93D]' },
  cooking: { label: 'Готовится', color: 'text-[#FF6B2B]', bg: 'bg-[#FF6B2B]/10', border: 'border-[#FF6B2B]/30', dot: 'bg-[#FF6B2B]' },
  ready: { label: 'Готово', color: 'text-[#6BCB77]', bg: 'bg-[#6BCB77]/10', border: 'border-[#6BCB77]/30', dot: 'bg-[#6BCB77]' },
  done: { label: 'Выдан', color: 'text-white/30', bg: 'bg-white/5', border: 'border-white/10', dot: 'bg-white/20' },
};

const NEXT_STATUS: Record<Order['status'], Order['status'] | null> = {
  new: 'cooking',
  cooking: 'ready',
  ready: 'done',
  done: null,
};

const NEXT_LABEL: Record<Order['status'], string> = {
  new: 'Начать готовить',
  cooking: 'Готово!',
  ready: 'Выдан',
  done: '',
};

function playNotificationSound() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523, 659, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.3);
      osc.start(ctx.currentTime + i * 0.15);
      osc.stop(ctx.currentTime + i * 0.15 + 0.3);
    });
  } catch (e) {
    void e;
  }
}

export default function KitchenScreen({ orders, onUpdateStatus, onGoToMenu, onLogout }: KitchenScreenProps) {
  const [flashIds, setFlashIds] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<'all' | 'active'>('active');
  const prevOrderIds = useRef<Set<string>>(new Set(orders.map(o => o.id)));

  useEffect(() => {
    const newIds = orders.filter(o => !prevOrderIds.current.has(o.id)).map(o => o.id);
    if (newIds.length > 0) {
      playNotificationSound();
      setFlashIds(new Set(newIds));
      setTimeout(() => setFlashIds(new Set()), 3000);
    }
    prevOrderIds.current = new Set(orders.map(o => o.id));
  }, [orders]);

  const filtered = filter === 'active'
    ? orders.filter(o => o.status !== 'done')
    : orders;

  const activeCount = orders.filter(o => o.status !== 'done').length;
  const newCount = orders.filter(o => o.status === 'new').length;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#FF6B2B]/10 border border-[#FF6B2B]/30 rounded-xl flex items-center justify-center">
              <Icon name="ChefHat" size={20} className="text-[#FF6B2B]" />
            </div>
            <div>
              <h1 className="font-oswald text-xl font-bold text-white tracking-wide">Панель кухни</h1>
              <p className="text-xs text-white/40 font-golos">
                {activeCount} активных · {newCount > 0 && <span className="text-[#FFD93D]">{newCount} новых</span>}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onGoToMenu}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white rounded-xl text-sm font-golos transition-all"
            >
              <Icon name="UtensilsCrossed" size={16} />
              Меню
            </button>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-900/20 text-white/60 hover:text-red-400 rounded-xl text-sm font-golos transition-all"
            >
              <Icon name="LogOut" size={16} />
              Выйти
            </button>
          </div>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="px-6 py-4 border-b border-white/5">
        <div className="max-w-6xl mx-auto flex gap-2">
          <button
            onClick={() => setFilter('active')}
            className={`category-chip font-golos ${filter === 'active' ? 'bg-[#FF6B2B] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Активные {activeCount > 0 && <span className="ml-1 bg-white/20 px-1.5 rounded-full text-xs">{activeCount}</span>}
          </button>
          <button
            onClick={() => setFilter('all')}
            className={`category-chip font-golos ${filter === 'all' ? 'bg-[#FF6B2B] text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
          >
            Все заказы
          </button>
        </div>
      </div>

      {/* Orders grid */}
      <main className="flex-1 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          {filtered.length === 0 && (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🍽️</div>
              <p className="text-white/40 font-golos text-lg">Нет активных заказов</p>
              <p className="text-white/20 font-golos text-sm mt-1">Ожидаем новые заказы...</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((order, i) => {
              const cfg = STATUS_CONFIG[order.status];
              const nextStatus = NEXT_STATUS[order.status];
              const isFlashing = flashIds.has(order.id);

              return (
                <div
                  key={order.id}
                  className={`kitchen-order-card animate-fade-in ${cfg.bg} ${cfg.border} ${
                    isFlashing ? 'animate-kitchen-flash' : ''
                  }`}
                  style={{ animationDelay: `${i * 0.06}s`, opacity: 0 }}
                >
                  {/* Order header */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {order.status === 'new' && (
                        <span className="relative flex w-2.5 h-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FFD93D] opacity-75"></span>
                          <span className="relative inline-flex rounded-full w-2.5 h-2.5 bg-[#FFD93D]"></span>
                        </span>
                      )}
                    </div>
                    <span className={`flex items-center gap-1.5 text-xs font-golos font-semibold px-3 py-1 rounded-full ${cfg.bg} ${cfg.color} border ${cfg.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}></span>
                      {cfg.label}
                    </span>
                  </div>

                  {/* Customer code — big */}
                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <p className="text-white/30 text-[10px] font-golos uppercase tracking-widest mb-0.5">Код клиента</p>
                      <div className="flex gap-1">
                        {order.code.split('').map((digit, di) => (
                          <span key={di} className="font-oswald text-4xl font-bold text-[#FF6B2B] leading-none w-9 text-center bg-[#FF6B2B]/10 rounded-lg py-1">
                            {digit}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="font-oswald font-bold text-white/50 text-sm">#{order.id.slice(-4)}</span>
                  </div>

                  {/* Time */}
                  <p className="text-white/30 text-xs font-golos mb-4">
                    <Icon name="Clock" size={12} className="inline mr-1" />
                    {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    · {Math.floor((Date.now() - new Date(order.createdAt).getTime()) / 60000)} мин назад
                  </p>

                  {/* Items */}
                  <div className="space-y-2 mb-5">
                    {order.items.map(c => (
                      <div key={c.item.id} className="flex justify-between items-center">
                        <span className="text-white/80 font-golos text-sm">{c.item.emoji} {c.item.name}</span>
                        <span className="font-oswald font-bold text-white text-sm">× {c.quantity}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-3 border-t border-white/10 flex justify-between items-center mb-4">
                    <span className="text-white/40 text-xs font-golos">Сумма заказа</span>
                    <span className="font-oswald font-bold text-white">{order.total} ₽</span>
                  </div>

                  {/* Action button */}
                  {nextStatus && (
                    <button
                      onClick={() => onUpdateStatus(order.id, nextStatus)}
                      className={`w-full py-3 rounded-xl font-golos font-semibold text-sm transition-all duration-200 hover:scale-[1.02] ${
                        order.status === 'new'
                          ? 'bg-[#FFD93D] text-[#0D0D0D] hover:bg-yellow-300'
                          : order.status === 'cooking'
                          ? 'bg-[#6BCB77] text-[#0D0D0D] hover:bg-green-400'
                          : 'bg-white/10 text-white/60 hover:bg-white/20'
                      }`}
                    >
                      {NEXT_LABEL[order.status]}
                    </button>
                  )}
                  {!nextStatus && (
                    <div className="text-center text-white/20 text-sm font-golos py-2">✓ Выдан</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}