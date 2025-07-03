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
        getItem: async (key) => await AsyncStorage.getItem(key),
        setItem: async (key, value) => await AsyncStorage.setItem(key, value),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);
