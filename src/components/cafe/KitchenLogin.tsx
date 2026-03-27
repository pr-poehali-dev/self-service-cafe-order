import { useState } from 'react';
import Icon from '@/components/ui/icon';

interface KitchenLoginProps {
  onLogin: (password: string) => boolean;
  onBack: () => void;
}

export default function KitchenLogin({ onLogin, onBack }: KitchenLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = () => {
    const ok = onLogin(password);
    if (!ok) {
      setError(true);
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col items-center justify-center px-6">
      <div className={`w-full max-w-sm animate-scale-in ${shake ? 'animate-[shake_0.5s_ease]' : ''}`} style={{ opacity: 0 }}>
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#FF6B2B]/10 border border-[#FF6B2B]/30 rounded-3xl flex items-center justify-center mx-auto mb-5">
            <Icon name="ChefHat" size={36} className="text-[#FF6B2B]" />
          </div>
          <h1 className="font-oswald text-3xl font-bold text-white tracking-wide">Панель кухни</h1>
          <p className="text-white/40 font-golos text-sm mt-2">Введите пароль для доступа</p>
        </div>

        <div className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 space-y-5">
          <div>
            <label className="text-white/60 text-xs font-golos uppercase tracking-widest block mb-2">Пароль</label>
            <input
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••"
              className={`w-full bg-[#0D0D0D] border rounded-2xl px-5 py-4 text-white font-golos text-lg focus:outline-none transition-all duration-200 ${
                error
                  ? 'border-red-500/50 focus:border-red-500'
                  : 'border-white/10 focus:border-[#FF6B2B]/50'
              }`}
            />
            {error && (
              <p className="text-red-400 text-sm font-golos mt-2 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} />
                Неверный пароль
              </p>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!password}
            className="w-full bg-[#FF6B2B] hover:bg-[#e55a1f] disabled:opacity-30 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-oswald text-lg font-bold tracking-wide transition-all duration-200 hover:scale-[1.02]"
          >
            Войти на кухню
          </button>
        </div>

        <button
          onClick={onBack}
          className="w-full text-center text-white/30 hover:text-white/60 mt-6 text-sm font-golos transition-colors"
        >
          ← Вернуться к меню
        </button>
      </div>
    </div>
  );
}
