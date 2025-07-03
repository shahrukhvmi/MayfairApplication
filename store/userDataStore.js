// store/useUserDataStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useUserDataStore = create(
  persist(
    (set) => ({
      userData: null,
      setUserData: (userData) => set({ userData }),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: 'user-data-storage', // storage key
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, value);
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useUserDataStore;
