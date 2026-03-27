import { Order } from '@/types/cafe';
import Icon from '@/components/ui/icon';

interface StatusScreenProps {
  order: Order;
  onNewOrder: () => void;
}

const STEPS = [
  { key: 'new', label: 'Принят', icon: 'ClipboardCheck', desc: 'Заказ получен кухней' },
  { key: 'cooking', label: 'Готовится', icon: 'ChefHat', desc: 'Повар приступил к работе' },
  { key: 'ready', label: 'Готово!', icon: 'Bell', desc: 'Можете забирать заказ' },
] as const;

const STATUS_ORDER = ['new', 'cooking', 'ready', 'done'];

export default function StatusScreen({ order, onNewOrder }: StatusScreenProps) {
  const currentIdx = STATUS_ORDER.indexOf(order.status);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Order number */}
        <div className="text-center mb-10 animate-fade-in" style={{ opacity: 0 }}>
          <p className="text-white/40 font-golos text-sm uppercase tracking-widest mb-2">Номер заказа</p>
          <h1 className="font-oswald text-7xl font-bold text-[#FF6B2B] neon-text">
            #{order.id.slice(-3)}
          </h1>
          <p className="text-white/30 text-xs mt-2 font-golos">
            {new Date(order.createdAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Status steps */}
        <div className="space-y-3 mb-10">
          {STEPS.map((step, i) => {
            const stepIdx = STATUS_ORDER.indexOf(step.key);
            const isDone = currentIdx > stepIdx;
            const isActive = currentIdx === stepIdx;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-500 animate-fade-in ${
                  isActive
                    ? 'bg-[#FF6B2B]/10 border-[#FF6B2B]/40 shadow-lg shadow-orange-900/20'
                    : isDone
                    ? 'bg-[#6BCB77]/5 border-[#6BCB77]/20'
                    : 'bg-[#1A1A1A] border-white/5'
                }`}
                style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  isActive ? 'bg-[#FF6B2B]' : isDone ? 'bg-[#6BCB77]' : 'bg-white/5'
                }`}>
                  {isDone
                    ? <Icon name="Check" size={22} className="text-white" />
                    : <Icon name={step.icon} size={22} className={isActive ? 'text-white' : 'text-white/30'} />
                  }
                </div>
                <div className="flex-1">
                  <p className={`font-golos font-semibold text-sm ${isActive ? 'text-white' : isDone ? 'text-white/60' : 'text-white/30'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs ${isActive ? 'text-white/60' : 'text-white/20'}`}>{step.desc}</p>
                </div>
                {isActive && (
                  <div className="w-2 h-2 bg-[#FF6B2B] rounded-full animate-pulse" />
                )}
              </div>
            );
          })}
        </div>

        {/* Order items summary */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 mb-8 animate-fade-in" style={{ animationDelay: '0.4s', opacity: 0 }}>
          <p className="text-white/40 text-xs font-golos uppercase tracking-widest mb-3">Состав заказа</p>
          <div className="space-y-2">
            {order.items.map(c => (
              <div key={c.item.id} className="flex justify-between items-center">
                <span className="text-white/70 font-golos text-sm">{c.item.emoji} {c.item.name} × {c.quantity}</span>
                <span className="text-white font-oswald font-bold">{c.item.price * c.quantity} ₽</span>
              </div>
            ))}
          </div>
          <div className="pt-3 mt-3 border-t border-white/5 flex justify-between">
            <span className="font-oswald text-white font-bold">Итого</span>
            <span className="font-oswald text-[#FF6B2B] font-bold text-lg">{order.total} ₽</span>
          </div>
        </div>

        {/* Ready state */}
        {order.status === 'ready' && (
          <div className="bg-[#6BCB77]/10 border border-[#6BCB77]/30 rounded-2xl p-5 mb-6 text-center animate-bounce-in">
            <p className="text-5xl mb-2">🎉</p>
            <p className="font-oswald text-[#6BCB77] text-xl font-bold">Заказ готов!</p>
            <p className="text-white/60 text-sm font-golos mt-1">Подойдите к стойке за вашим заказом</p>
          </div>
        )}

        <button
          onClick={onNewOrder}
          className="w-full border border-white/10 hover:border-white/20 text-white/60 hover:text-white py-4 rounded-2xl font-golos text-sm transition-all duration-200 hover:bg-white/5"
        >
          ← Сделать новый заказ
        </button>
      </div>
    </div>
  );
}