// store/useImpersonate.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useImpersonate = create(
  persist(
    (set) => ({
      impersonate: false,
      setImpersonate: (impersonate) => set({ impersonate }),
      clearImpersonate: () => set({ impersonate: false }),
    }),
    {
      name: 'impersonate-user',
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

export default useImpersonate;
