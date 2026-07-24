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
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);

export default useOrderId;
