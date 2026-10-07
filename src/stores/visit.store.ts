import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type VisitStatus = 'pending' | 'accepted' | 'declined';

export type VisitRequest = {
  id: string;
  phone: string;
  tenantName: string;
  homeId: string;
  ownerId: string;
  day: string;
  time: string;
  note: string;
  status: VisitStatus;
  createdAt: number;
};

type NewVisit = Omit<VisitRequest, 'id' | 'status' | 'createdAt'>;

type VisitState = {
  requests: VisitRequest[];
  save: (request: NewVisit) => void;
  setStatus: (id: string, status: VisitStatus) => void;
};

export const useVisitStore = create<VisitState>()(
  persist(
    set => ({
      requests: [],
      save: request =>
        set(state => {
          const now = Date.now();
          return {
            requests: [
              { ...request, id: `visit-${now}`, status: 'pending', createdAt: now },
              ...state.requests.filter(item => item.phone !== request.phone || item.homeId !== request.homeId),
            ],
          };
        }),
      setStatus: (id, status) =>
        set(state => ({
          requests: state.requests.map(item => (item.id === id ? { ...item, status } : item)),
        })),
    }),
    {
      name: 'rentghar-visits',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useVisit(phone: string, homeId: string) {
  return useVisitStore(state => state.requests.find(item => item.phone === phone && item.homeId === homeId));
}

export function useOwnerVisits(ownerId: string) {
  const requests = useVisitStore(state => state.requests);
  return requests.filter(item => item.ownerId === ownerId && item.status !== 'declined');
}
