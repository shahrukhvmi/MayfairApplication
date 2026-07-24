import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useStatusStore = create(
  persist(
    (set) => ({
      status: 'all',
      setStatus: (newStatus) => set({ status: newStatus }),
      clearStatus: () => set({ status: 'all' }),
    }),
    {
      name: 'status-storage',
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => await AsyncStorage.setItem(key, JSON.stringify(value)),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);
