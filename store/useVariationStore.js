import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useVariationStore = create(
  persist(
    (set) => ({
      variation: [],
      setVariation: (variation) => set({ variation }),
      clearVariation: () => set({ variation: [] }),
    }),
    {
      name: 'variation-storage',
      storage: createJSONStorage(() => AsyncStorage), // ✅ correct way
    }
  )
);

export default useVariationStore;
