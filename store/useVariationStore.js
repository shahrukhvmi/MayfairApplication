import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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
      storage: {
        getItem: async (key) => await AsyncStorage.getItem(key),
        setItem: async (key, value) => await AsyncStorage.setItem(key, value),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);

export default useVariationStore;
