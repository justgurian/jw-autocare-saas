import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  addFavorite: (href: string) => void;
  removeFavorite: (href: string) => void;
  isFavorite: (href: string) => boolean;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (href) => {
        const current = get().favorites;
        if (current.length >= 5 || current.includes(href)) return;
        set({ favorites: [...current, href] });
      },
      removeFavorite: (href) =>
        set({ favorites: get().favorites.filter((f) => f !== href) }),
      isFavorite: (href) => get().favorites.includes(href),
    }),
    { name: 'bayfiller-favorites' }
  )
);
