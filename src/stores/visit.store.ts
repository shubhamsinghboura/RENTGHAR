import { create } from 'zustand';

export type VisitRequest = {
  phone: string;
  homeId: string;
  day: string;
  time: string;
  note: string;
};

type VisitState = {
  requests: VisitRequest[];
  save: (request: VisitRequest) => void;
};

export const useVisitStore = create<VisitState>(set => ({
  requests: [],
  save: request =>
    set(state => ({
      requests: [
        request,
        ...state.requests.filter(item => item.phone !== request.phone || item.homeId !== request.homeId),
      ],
    })),
}));

export function useVisit(phone: string, homeId: string) {
  return useVisitStore(state => state.requests.find(item => item.phone === phone && item.homeId === homeId));
}
