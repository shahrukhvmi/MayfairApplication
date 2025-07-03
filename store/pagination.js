// store/usePaginationStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePaginationStore = create(
  persist(
    (set) => ({
      currentPage: 1, // default to page 1
      setCurrentPage: (page) => set({ currentPage: page }),
      clearCurrentPage: () => set({ currentPage: 1 }),
    }),
    {
      name: 'pagination-storage', // Key in AsyncStorage
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

export default usePaginationStore;
