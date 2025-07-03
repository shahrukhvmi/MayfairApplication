// store/useCheckoutStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCheckoutStore = create(
  persist(
    (set) => ({
      checkout: null,
      setCheckout: (checkout) => set({ checkout }),
      clearCheckout: () => set({ checkout: null }),
    }),
    {
      name: 'checkout-storage', // key in AsyncStorage
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value;
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

export default useCheckoutStore;
