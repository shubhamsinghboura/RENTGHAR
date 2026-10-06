import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const emptyIds: string[] = [];

type SavedState = {
  lists: Record<string, string[]>;
  toggle: (phone: string, id: string) => void;
};

export const useSavedStore = create<SavedState>()(
  persist(
    set => ({
      lists: {},
      toggle: (phone, id) =>
        set(state => {
          const current = state.lists[phone] ?? [];
          const next = current.includes(id) ? current.filter(item => item !== id) : [id, ...current];
          return { lists: { ...state.lists, [phone]: next } };
        }),
    }),
    {
      name: 'rentghar-shortlist',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useShortlist(phone: string) {
  return useSavedStore(state => state.lists[phone] ?? emptyIds);
}
