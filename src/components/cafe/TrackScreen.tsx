import { useState, useEffect, useCallback } from 'react';
import { Order } from '@/types/cafe';
import { fetchOrderByCode } from '@/api/cafe';
import Icon from '@/components/ui/icon';

interface TrackScreenProps {
  onBack: () => void;
}

const STATUS_CONFIG = {
  new:     { label: 'Принят',    icon: 'ClipboardCheck', color: 'text-[#FFD93D]', bg: 'bg-[#FFD93D]/10',  border: 'border-[#FFD93D]/30',  fill: 'bg-[#FFD93D]'  },
  cooking: { label: 'Готовится', icon: 'ChefHat',         color: 'text-[#FF6B2B]', bg: 'bg-[#FF6B2B]/10',  border: 'border-[#FF6B2B]/30',  fill: 'bg-[#FF6B2B]'  },
  ready:   { label: 'Готово!',   icon: 'Bell',            color: 'text-[#6BCB77]', bg: 'bg-[#6BCB77]/10',  border: 'border-[#6BCB77]/30',  fill: 'bg-[#6BCB77]'  },
  done:    { label: 'Выдан',     icon: 'CheckCircle',     color: 'text-white/40',  bg: 'bg-white/5',       border: 'border-white/10',      fill: 'bg-white/30'   },
};

const STATUS_ORDER = ['new', 'cooking', 'ready', 'done'] as const;

export default function TrackScreen({ onBack }: TrackScreenProps) {
  const [input, setInput] = useState('');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const search = async (code: string) => {
    if (code.length !== 4) return;
    setLoading(true);
    setNotFound(false);
    setOrder(null);
    const result = await fetchOrderByCode(code);
    if (result) {
      setOrder(result);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  };

  const handleInput = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setInput(digits);
    setNotFound(false);
    if (digits.length === 4) search(digits);
  };

  const refresh = useCallback(async () => {
    if (!order) return;
    const updated = await fetchOrderByCode(order.code);
    if (updated) setOrder(updated);
  }, [order]);

  useEffect(() => {
    if (!order || order.status === 'done') return;
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [order, refresh]);

  const currentIdx = order ? STATUS_ORDER.indexOf(order.status as typeof STATUS_ORDER[number]) : -1;

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="ArrowLeft" size={20} className="text-white" />
          </button>
          <div>
            <h1 className="font-oswald text-xl font-bold text-white tracking-wide">Отследить заказ</h1>
            <p className="text-xs text-white/40 font-golos">Введите 4-значный код</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-8">
        <div className="max-w-lg mx-auto">

          {/* Code input */}
          <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-6 mb-6 animate-fade-in" style={{ opacity: 0 }}>
            <label className="text-white/40 text-xs font-golos uppercase tracking-widest block mb-4">Код заказа</label>

            {/* Digit cells */}
            <div className="flex gap-3 justify-center mb-4">
              {[0,1,2,3].map(i => (
                <div
                  key={i}
                  className={`w-16 h-20 rounded-2xl flex items-center justify-center border-2 transition-all duration-200 ${
                    input[i]
                      ? 'bg-[#FF6B2B]/10 border-[#FF6B2B]/50'
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <span className="font-oswald text-4xl font-bold text-[#FF6B2B]">
                    {input[i] || <span className="text-white/10">·</span>}
                  </span>
                </div>
              ))}
            </div>

            <input
              type="tel"
              inputMode="numeric"
              value={input}
              onChange={e => handleInput(e.target.value)}
              placeholder="Введите код"
              maxLength={4}
              className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#FF6B2B]/50 rounded-xl px-4 py-3 text-white font-oswald text-center text-2xl tracking-[0.5em] focus:outline-none transition-colors"
            />

            {notFound && (
              <p className="text-red-400 text-sm font-golos text-center mt-3 flex items-center justify-center gap-1.5">
                <Icon name="AlertCircle" size={15} />
                Заказ с кодом <strong>{input}</strong> не найден
              </p>
            )}

            {loading && (
              <p className="text-white/40 text-sm font-golos text-center mt-3 flex items-center justify-center gap-2">
                <Icon name="Loader" size={15} className="animate-spin" />
                Ищем заказ...
              </p>
            )}
          </div>

          {/* Order found */}
          {order && (
            <div className="space-y-4 animate-slide-up" style={{ opacity: 0 }}>
              {/* Code badge */}
              <div className="flex items-center justify-between bg-[#1A1A1A] border border-white/5 rounded-2xl px-5 py-4">
                <div>
                  <p className="text-white/30 text-xs font-golos uppercase tracking-widest">Ваш заказ</p>
                  <div className="flex gap-1 mt-1">
                    {order.code.split('').map((d, i) => (
                      <span key={i} className="font-oswald text-3xl font-bold text-[#FF6B2B] w-8 text-center">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white/30 text-xs font-golos">Сумма</p>
                  <p className="font-oswald text-xl font-bold text-white">{order.total} ₽</p>
                </div>
              </div>

              {/* Status steps */}
              <div className="space-y-2">
                {STATUS_ORDER.slice(0, 3).map((key, i) => {
                  const cfg = STATUS_CONFIG[key];
                  const stepIdx = STATUS_ORDER.indexOf(key);
                  const isDone = currentIdx > stepIdx;
                  const isActive = currentIdx === stepIdx;

                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-500 ${
                        isActive  ? `${cfg.bg} ${cfg.border} shadow-lg` :
                        isDone    ? 'bg-[#6BCB77]/5 border-[#6BCB77]/20' :
                                    'bg-[#1A1A1A] border-white/5'
                      }`}
                    >
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive ? cfg.fill : isDone ? 'bg-[#6BCB77]' : 'bg-white/5'
                      }`}>
                        {isDone
                          ? <Icon name="Check" size={20} className="text-white" />
                          : <Icon name={cfg.icon} size={20} className={isActive ? 'text-white' : 'text-white/25'} />
                        }
                      </div>
                      <div className="flex-1">
                        <p className={`font-golos font-semibold text-sm ${
                          isActive ? 'text-white' : isDone ? 'text-white/50' : 'text-white/25'
                        }`}>{cfg.label}</p>
                      </div>
                      {isActive && <div className="w-2 h-2 rounded-full bg-current animate-pulse" style={{ color: cfg.color.replace('text-', '') }} />}
                    </div>
                  );
                })}
              </div>

              {/* Ready banner */}
              {order.status === 'ready' && (
                <div className="bg-[#6BCB77]/10 border border-[#6BCB77]/30 rounded-2xl p-5 text-center">
                  <p className="text-4xl mb-2">🎉</p>
                  <p className="font-oswald text-[#6BCB77] text-xl font-bold">Заказ готов!</p>
                  <p className="text-white/50 text-sm font-golos mt-1">
                    Назовите код <strong className="text-[#6BCB77]">{order.code}</strong> на стойке
                  </p>
                </div>
              )}

              {/* Items */}
              <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5">
                <p className="text-white/30 text-xs font-golos uppercase tracking-widest mb-3">Состав</p>
                <div className="space-y-2">
                  {order.items.map(c => (
                    <div key={c.item.id} className="flex justify-between">
                      <span className="text-white/70 font-golos text-sm">{c.item.emoji} {c.item.name} × {c.quantity}</span>
                      <span className="text-white font-oswald font-bold text-sm">{c.item.price * c.quantity} ₽</span>
                    </div>
                  ))}
                </div>
              </div>

              {order.status !== 'done' && (
                <p className="text-center text-white/20 text-xs font-golos flex items-center justify-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#FF6B2B] rounded-full animate-pulse inline-block"></span>
                  Обновляется каждые 5 секунд
                </p>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
