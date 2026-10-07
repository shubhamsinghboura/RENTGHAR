import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { AccountRole } from '../views/auth/RoleScreen';

export type Session = {
  name: string;
  role: AccountRole;
  phone: string;
};

type AuthState = {
  session: Session | null;
  signIn: (session: Session) => void;
  rename: (name: string) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    set => ({
      session: null,
      signIn: session => set({ session }),
      rename: name => set(state => (state.session ? { session: { ...state.session, name } } : state)),
      signOut: () => set({ session: null }),
    }),
    {
      name: 'rentghar-session',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({ session: state.session }),
    },
  ),
);

export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() => useAuthStore.persist.hasHydrated());

  useEffect(() => {
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => setHydrated(true));
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsubscribe;
  }, []);

  return hydrated;
}

