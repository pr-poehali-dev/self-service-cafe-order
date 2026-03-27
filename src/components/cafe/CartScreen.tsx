import { CartItem, Order } from '@/types/cafe';
import Icon from '@/components/ui/icon';

interface CartScreenProps {
  cart: CartItem[];
  onBack: () => void;
  onRemove: (id: string) => void;
  onAdd: (id: string) => void;
  onPlaceOrder: () => void;
  lastOrder: Order | null;
  placing?: boolean;
}

export default function CartScreen({ cart, onBack, onRemove, onAdd, onPlaceOrder, lastOrder, placing }: CartScreenProps) {
  const total = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <Icon name="ArrowLeft" size={20} className="text-white" />
          </button>
          <div>
            <h1 className="font-oswald text-xl font-bold text-white tracking-wide">Ваш заказ</h1>
            <p className="text-xs text-white/40">{cart.length} позиций в корзине</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {cart.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🛒</div>
              <p className="text-white/40 font-golos text-lg">Корзина пуста</p>
              <button onClick={onBack} className="mt-4 text-[#FF6B2B] hover:underline text-sm">
                Вернуться в меню
              </button>
            </div>
          )}

          {cart.map((c, i) => (
            <div
              key={c.item.id}
              className="flex items-center gap-4 bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 animate-fade-in"
              style={{ animationDelay: `${i * 0.05}s`, opacity: 0 }}
            >
              <div className="text-4xl w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center shrink-0">
                {c.item.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-golos font-semibold text-white text-sm">{c.item.name}</p>
                <p className="font-oswald text-[#FF6B2B] font-bold">{c.item.price} ₽</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => onRemove(c.item.id)}
                  className="w-8 h-8 rounded-xl bg-white/5 hover:bg-red-900/30 hover:text-red-400 text-white/60 flex items-center justify-center transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="w-6 text-center font-oswald font-bold text-white text-lg">{c.quantity}</span>
                <button
                  onClick={() => onAdd(c.item.id)}
                  className="w-8 h-8 rounded-xl bg-[#FF6B2B]/20 hover:bg-[#FF6B2B] text-[#FF6B2B] hover:text-white flex items-center justify-center transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
              <div className="w-20 text-right shrink-0">
                <p className="font-oswald font-bold text-white">{c.item.price * c.quantity} ₽</p>
              </div>
            </div>
          ))}

          {/* Summary */}
          {cart.length > 0 && (
            <div className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-5 mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/60 font-golos text-sm">Позиций</span>
                <span className="text-white font-golos">{cart.reduce((s, c) => s + c.quantity, 0)} шт.</span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-white/5">
                <span className="font-oswald text-white text-xl font-bold">Итого</span>
                <span className="font-oswald text-[#FF6B2B] text-2xl font-bold">{total} ₽</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {cart.length > 0 && (
        <div className="sticky bottom-0 px-6 py-4 bg-[#0D0D0D]/95 backdrop-blur-xl border-t border-white/5">
          <div className="max-w-2xl mx-auto">
            <button
              onClick={onPlaceOrder}
              disabled={placing}
              className="w-full bg-[#FF6B2B] hover:bg-[#e55a1f] disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-oswald text-xl font-bold tracking-wide transition-all duration-200 hover:scale-[1.02] shadow-xl shadow-orange-900/30 flex items-center justify-center gap-3"
            >
              <Icon name={placing ? 'Loader' : 'CheckCircle'} size={22} className={placing ? 'animate-spin' : ''} />
              {placing ? 'Отправляем заказ...' : 'Оформить заказ'}
            </button>
            <p className="text-center text-white/30 text-xs mt-3 font-golos">
              Нажимая «Оформить», вы подтверждаете заказ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}