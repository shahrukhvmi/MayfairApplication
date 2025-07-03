// store/useOrderId.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useOrderId = create(
  persist(
    (set) => ({
      orderId: null,
      setOrderId: (orderId) => set({ orderId }),
      clearOrderId: () => set({ orderId: null }),
    }),
    {
      name: 'orderId-storage',
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

export default useOrderId;
