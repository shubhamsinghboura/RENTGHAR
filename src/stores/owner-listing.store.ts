import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type ListingStatus = 'listed' | 'hidden' | 'rented';

export type OwnerListing = {
  id: string;
  title: string;
  city: string;
  area: string;
  type: string;
  rent: string;
  deposit?: string;
  furnishing?: string;
  available?: string;
  description?: string;
  images?: string[];
  ownerName?: string;
  ownerPhoto?: string;
  status?: ListingStatus;
  rentedAt?: number;
  createdAt?: number;
};

export type NewListing = Required<
  Omit<OwnerListing, 'id' | 'createdAt' | 'ownerPhoto' | 'status' | 'rentedAt'>
>;

const emptyListings: OwnerListing[] = [];

type OwnerListingState = {
  homes: Record<string, OwnerListing[]>;
  add: (phone: string, home: NewListing) => void;
  update: (phone: string, id: string, home: NewListing) => void;
  setStatus: (phone: string, id: string, status: ListingStatus) => void;
  remove: (phone: string, id: string) => void;
};

function change(
  homes: Record<string, OwnerListing[]>,
  phone: string,
  id: string,
  edit: (listing: OwnerListing) => OwnerListing,
) {
  return {
    homes: {
      ...homes,
      [phone]: (homes[phone] ?? []).map(listing => (listing.id === id ? edit(listing) : listing)),
    },
  };
}

export const useOwnerListingStore = create<OwnerListingState>()(
  persist(
    set => ({
      homes: {},
      add: (phone, home) =>
        set(state => {
          if (!phone) {
            return state;
          }
          const now = Date.now();
          const listing: OwnerListing = {
            ...home,
            id: `home-${now}`,
            status: 'listed',
            createdAt: now,
          };
          return {
            homes: {
              ...state.homes,
              [phone]: [listing, ...(state.homes[phone] ?? [])],
            },
          };
        }),
      update: (phone, id, home) => set(state => change(state.homes, phone, id, listing => ({ ...listing, ...home }))),
      setStatus: (phone, id, status) =>
        set(state =>
          change(state.homes, phone, id, listing => ({
            ...listing,
            status,
            rentedAt: status === 'rented' ? Date.now() : undefined,
          })),
        ),
      remove: (phone, id) =>
        set(state => ({
          homes: {
            ...state.homes,
            [phone]: (state.homes[phone] ?? []).filter(listing => listing.id !== id),
          },
        })),
    }),
    {
      name: 'rentghar-owner-homes',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function statusOf(listing: OwnerListing): ListingStatus {
  return listing.status ?? 'listed';
}

export function useOwnerHomes(phone: string) {
  return useOwnerListingStore(state => state.homes[phone] ?? emptyListings);
}
