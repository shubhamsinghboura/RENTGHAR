import { useMemo } from 'react';

import { homes as seedHomes, type HomeListing } from '../data/homes';
import { findOwner, type OwnerProfile } from '../data/owners';
import { statusOf, useOwnerListingStore, type OwnerListing } from './owner-listing.store';
import { useProfileStore } from './profile.store';
import { useProfilePhotoStore } from './profile-photo.store';

const ownerPrefix = 'owner-';

export function localOwnerId(phone: string) {
  return `${ownerPrefix}${phone}`;
}

function toHome(phone: string, listing: OwnerListing): HomeListing | null {
  const images = listing.images ?? [];
  if (images.length === 0) {
    return null;
  }
  return {
    id: listing.id,
    ownerId: localOwnerId(phone),
    city: listing.city,
    type: listing.type,
    title: listing.title,
    area: listing.area,
    rent: listing.rent,
    deposit: listing.deposit ?? '—',
    images,
    description: listing.description ?? '',
    furnishing: listing.furnishing ?? '—',
    available: listing.available ?? 'Available now',
  };
}

function ownerHomes(all: Record<string, OwnerListing[]>, listedOnly: boolean) {
  return Object.entries(all).flatMap(([phone, list]) =>
    list
      .filter(listing => !listedOnly || statusOf(listing) === 'listed')
      .map(listing => toHome(phone, listing))
      .filter((home): home is HomeListing => Boolean(home)),
  );
}

export function useAllHomes() {
  const local = useOwnerListingStore(state => state.homes);
  return useMemo(() => [...ownerHomes(local, true), ...seedHomes], [local]);
}

export function useHome(id: string) {
  const all = useAllHomes();
  return useMemo(() => all.find(home => home.id === id), [all, id]);
}

export function useAnyHome(id: string | undefined) {
  const local = useOwnerListingStore(state => state.homes);
  return useMemo(
    () => (id ? [...ownerHomes(local, false), ...seedHomes].find(home => home.id === id) : undefined),
    [local, id],
  );
}

export function useOwner(id: string | undefined): OwnerProfile | undefined {
  const local = useOwnerListingStore(state => state.homes);
  const photos = useProfilePhotoStore(state => state.photos);
  const names = useProfileStore(state => state.names);
  const abouts = useProfileStore(state => state.abouts);
  return useMemo(() => {
    if (!id) {
      return undefined;
    }
    const seed = findOwner(id);
    if (seed || !id.startsWith(ownerPrefix)) {
      return seed;
    }
    const phone = id.slice(ownerPrefix.length);
    const all = (local[phone] ?? []).filter(listing => (listing.images ?? []).length > 0);
    const list = all.filter(listing => statusOf(listing) === 'listed');
    const latest = list[0] ?? all[0];
    if (!latest) {
      return undefined;
    }
    const first = all[all.length - 1];
    const since = first?.createdAt ? new Date(first.createdAt).getFullYear() : new Date().getFullYear();
    const count = list.length === 1 ? 'Lists one home on RentGhar.' : `Lists ${list.length} homes on RentGhar.`;
    return {
      id,
      name: names[phone] || latest.ownerName || 'Owner',
      photo: photos[phone] ?? '',
      city: latest.city,
      area: latest.area,
      since: String(since),
      about: abouts[phone] || count,
      homeIds: list.map(listing => listing.id),
    };
  }, [id, local, photos, names, abouts]);
}
