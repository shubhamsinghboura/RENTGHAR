import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const empty = '';

type PhotoState = {
  photos: Record<string, string>;
  setPhoto: (phone: string, photo: string | null) => void;
};

export const useProfilePhotoStore = create<PhotoState>()(
  persist(
    set => ({
      photos: {},
      setPhoto: (phone, photo) =>
        set(state => {
          const photos = { ...state.photos };
          if (photo) {
            photos[phone] = photo;
          } else {
            delete photos[phone];
          }
          return { photos };
        }),
    }),
    {
      name: 'rentghar-profile-photo',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export function useProfilePhoto(phone: string) {
  return useProfilePhotoStore(state => state.photos[phone] ?? empty);
}
