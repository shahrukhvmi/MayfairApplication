// store/useProductId.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useProductId = create(
  persist(
    (set) => ({
      productId: null,
      setProductId: (productId) => set({ productId }),
      clearProductId: () => set({ productId: null }),
    }),
    {
      name: 'product-id', // key used in AsyncStorage
      storage: {
        getItem: async (key) => {
          return await AsyncStorage.getItem(key);
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, value);
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);

export default useProductId;
