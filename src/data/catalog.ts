import { useMemo } from 'react';

import { useOwnerListingStore, type OwnerListing } from '../stores/owner-listing.store';

import { homes, type HomeListing } from './homes';

export function ownerIdFor(phone: string) {
  return `listed:${phone}`;
}

export function toHomeListing(phone: string, listing: OwnerListing): HomeListing {
  return {
    id: listing.id,
    ownerId: ownerIdFor(phone),
    city: listing.city,
    type: listing.type,
    title: listing.title,
    area: listing.area,
    rent: listing.rent,
    deposit: listing.deposit ?? '',
    images: listing.images ?? [],
    description: listing.description ?? '',
    furnishing: listing.furnishing ?? '',
    available: listing.available ?? '',
    ownerName: listing.ownerName ?? '',
    ownerPhoto: listing.ownerPhoto ?? '',
  };
}

export function useHomes() {
  const groups = useOwnerListingStore(state => state.homes);
  return useMemo(() => {
    const added = Object.entries(groups).flatMap(([phone, items]) => items.map(item => toHomeListing(phone, item)));
    return [...added, ...homes];
  }, [groups]);
}

export function useHome(id: string | undefined) {
  const all = useHomes();
  if (!id) {
    return undefined;
  }
  return all.find(home => home.id === id);
}
