import { MenuItem } from '@/types/cafe';

export const INITIAL_MENU: MenuItem[] = [
  { id: '1', name: 'Капучино', description: 'Эспрессо с молочной пенкой', price: 280, category: 'Напитки', emoji: '☕', available: true },
  { id: '2', name: 'Латте', description: 'Нежный кофе с молоком', price: 320, category: 'Напитки', emoji: '🥛', available: true },
  { id: '3', name: 'Апельсиновый сок', description: 'Свежевыжатый', price: 250, category: 'Напитки', emoji: '🍊', available: true },
  { id: '4', name: 'Чай с мятой', description: 'Травяной, успокаивающий', price: 180, category: 'Напитки', emoji: '🍵', available: true },
  { id: '5', name: 'Авокадо-тост', description: 'На хлебе из закваски, рикотта, яйцо пашот', price: 490, category: 'Завтраки', emoji: '🥑', available: true },
  { id: '6', name: 'Овсяная каша', description: 'С ягодами и мёдом', price: 310, category: 'Завтраки', emoji: '🥣', available: true },
  { id: '7', name: 'Яйца бенедикт', description: 'С лососем и голландским соусом', price: 580, category: 'Завтраки', emoji: '🍳', available: true },
  { id: '8', name: 'Бургер классик', description: 'Говяжья котлета, чеддер, салат, томат', price: 650, category: 'Основное', emoji: '🍔', available: true },
  { id: '9', name: 'Паста Карбонара', description: 'Бекон, яйцо, пармезан', price: 590, category: 'Основное', emoji: '🍝', available: true },
  { id: '10', name: 'Цезарь с курицей', description: 'Салат, курица, пармезан, гренки', price: 480, category: 'Салаты', emoji: '🥗', available: true },
  { id: '11', name: 'Греческий салат', description: 'Овощи, фета, маслины', price: 420, category: 'Салаты', emoji: '🫙', available: true },
  { id: '12', name: 'Чизкейк', description: 'Нью-Йорк стайл, ягодный соус', price: 380, category: 'Десерты', emoji: '🍰', available: true },
  { id: '13', name: 'Тирамису', description: 'Классический итальянский', price: 360, category: 'Десерты', emoji: '🍮', available: true },
  { id: '14', name: 'Брауни', description: 'Шоколадный, с мороженым', price: 320, category: 'Десерты', emoji: '🍫', available: true },
];

export const CATEGORIES = ['Все', 'Напитки', 'Завтраки', 'Основное', 'Салаты', 'Десерты'];

export const KITCHEN_PASSWORD = '1234';
