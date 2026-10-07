import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ProfileState = {
  names: Record<string, string>;
  abouts: Record<string, string>;
  save: (phone: string, profile: { name: string; about?: string }) => void;
};

export const useProfileStore = create<ProfileState>()(
  persist(
    set => ({
      names: {},
      abouts: {},
      save: (phone, profile) =>
        set(state => ({
          names: { ...state.names, [phone]: profile.name },
          abouts: profile.about === undefined ? state.abouts : { ...state.abouts, [phone]: profile.about },
        })),
    }),
    {
      name: 'rentghar-profiles',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function usePersonName(phone: string, fallback: string) {
  return useProfileStore(state => state.names[phone]) || fallback;
}

export function useAbout(phone: string) {
  return useProfileStore(state => state.abouts[phone] ?? '');
}
