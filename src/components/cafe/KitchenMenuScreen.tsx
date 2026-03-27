import { useState } from 'react';
import { MenuItem } from '@/types/cafe';
import { CATEGORIES } from '@/data/menuData';
import Icon from '@/components/ui/icon';

interface KitchenMenuScreenProps {
  menu: MenuItem[];
  onUpdate: (menu: MenuItem[]) => void;
  onBack: () => void;
}

const EMOJIS = ['☕','🥛','🍊','🍵','🥑','🥣','🍳','🍔','🍝','🥗','🫙','🍰','🍮','🍫','🍕','🥩','🍣','🍜','🧆','🥞'];

export default function KitchenMenuScreen({ menu, onUpdate, onBack }: KitchenMenuScreenProps) {
  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [form, setForm] = useState<Partial<MenuItem>>({});

  const openEdit = (item: MenuItem) => {
    setEditing(item);
    setForm({ ...item });
    setIsNew(false);
  };

  const openNew = () => {
    const blank: Partial<MenuItem> = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: 0,
      category: 'Основное',
      emoji: '🍔',
      available: true,
    };
    setForm(blank);
    setIsNew(true);
    setEditing({ ...blank } as MenuItem);
  };

  const save = () => {
    if (!form.name || !form.price) return;
    const updated = form as MenuItem;
    if (isNew) {
      onUpdate([...menu, updated]);
    } else {
      onUpdate(menu.map(m => m.id === updated.id ? updated : m));
    }
    setEditing(null);
  };

  const toggleAvailable = (id: string) => {
    onUpdate(menu.map(m => m.id === id ? { ...m, available: !m.available } : m));
  };

  const deleteItem = (id: string) => {
    onUpdate(menu.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] flex flex-col">
      <header className="sticky top-0 z-40 bg-[#0D0D0D]/90 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
              <Icon name="ArrowLeft" size={20} className="text-white" />
            </button>
            <div>
              <h1 className="font-oswald text-xl font-bold text-white tracking-wide">Управление меню</h1>
              <p className="text-xs text-white/40 font-golos">{menu.length} позиций · {menu.filter(m => m.available).length} доступно</p>
            </div>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 bg-[#FF6B2B] hover:bg-[#e55a1f] text-white px-5 py-2.5 rounded-xl font-golos font-semibold text-sm transition-all hover:scale-105"
          >
            <Icon name="Plus" size={18} />
            Добавить блюдо
          </button>
        </div>
      </header>

      <main className="flex-1 px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-2">
          {menu.map((item, i) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 rounded-2xl p-4 border transition-all duration-200 animate-fade-in ${
                item.available ? 'bg-[#1A1A1A] border-white/5' : 'bg-white/2 border-white/3 opacity-50'
              }`}
              style={{ animationDelay: `${i * 0.03}s`, opacity: 0 }}
            >
              <div className="text-3xl w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center shrink-0">{item.emoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-golos font-semibold text-white text-sm">{item.name}</p>
                  <span className="text-xs text-white/30 bg-white/5 px-2 py-0.5 rounded-full">{item.category}</span>
                </div>
                <p className="text-white/40 text-xs truncate">{item.description}</p>
              </div>
              <span className="font-oswald font-bold text-[#FF6B2B]">{item.price} ₽</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => toggleAvailable(item.id)}
                  className={`p-2 rounded-xl transition-colors ${item.available ? 'text-[#6BCB77] bg-[#6BCB77]/10 hover:bg-[#6BCB77]/20' : 'text-white/20 bg-white/5 hover:bg-white/10'}`}
                  title={item.available ? 'Скрыть' : 'Показать'}
                >
                  <Icon name={item.available ? 'Eye' : 'EyeOff'} size={16} />
                </button>
                <button
                  onClick={() => openEdit(item)}
                  className="p-2 rounded-xl text-white/40 bg-white/5 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Icon name="Pencil" size={16} />
                </button>
                <button
                  onClick={() => deleteItem(item.id)}
                  className="p-2 rounded-xl text-white/20 bg-white/5 hover:bg-red-900/30 hover:text-red-400 transition-colors"
                >
                  <Icon name="Trash2" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Edit modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-6">
          <div className="w-full max-w-md bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 animate-slide-up space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-oswald text-xl font-bold text-white">{isNew ? 'Новое блюдо' : 'Редактировать'}</h2>
              <button onClick={() => setEditing(null)} className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center">
                <Icon name="X" size={18} className="text-white/60" />
              </button>
            </div>

            {/* Emoji picker */}
            <div>
              <label className="text-white/40 text-xs uppercase tracking-widest font-golos block mb-2">Иконка</label>
              <div className="flex flex-wrap gap-2">
                {EMOJIS.map(e => (
                  <button
                    key={e}
                    onClick={() => setForm(f => ({ ...f, emoji: e }))}
                    className={`w-9 h-9 rounded-xl text-xl transition-all ${form.emoji === e ? 'bg-[#FF6B2B]/30 ring-2 ring-[#FF6B2B] scale-110' : 'bg-white/5 hover:bg-white/10'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-white/40 text-xs uppercase tracking-widest font-golos block mb-1.5">Название *</label>
                <input
                  value={form.name || ''}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Капучино"
                  className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#FF6B2B]/50 rounded-xl px-4 py-3 text-white font-golos text-sm focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest font-golos block mb-1.5">Цена ₽ *</label>
                <input
                  type="number"
                  value={form.price || ''}
                  onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
                  placeholder="280"
                  className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#FF6B2B]/50 rounded-xl px-4 py-3 text-white font-golos text-sm focus:outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-white/40 text-xs uppercase tracking-widest font-golos block mb-1.5">Категория</label>
                <select
                  value={form.category || 'Основное'}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#FF6B2B]/50 rounded-xl px-4 py-3 text-white font-golos text-sm focus:outline-none transition-colors"
                >
                  {CATEGORIES.filter(c => c !== 'Все').map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="text-white/40 text-xs uppercase tracking-widest font-golos block mb-1.5">Описание</label>
                <input
                  value={form.description || ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Краткое описание блюда"
                  className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#FF6B2B]/50 rounded-xl px-4 py-3 text-white font-golos text-sm focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(null)} className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white font-golos text-sm transition-colors">
                Отмена
              </button>
              <button
                onClick={save}
                disabled={!form.name || !form.price}
                className="flex-1 py-3 rounded-xl bg-[#FF6B2B] hover:bg-[#e55a1f] disabled:opacity-30 text-white font-golos font-semibold text-sm transition-all hover:scale-[1.02]"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
