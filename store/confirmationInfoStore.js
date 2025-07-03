// store/useConfirmationInfoStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useConfirmationInfoStore = create(
  persist(
    (set) => ({
      confirmationInfo: [],
      setConfirmationInfo: (confirmationInfo) => set({ confirmationInfo }),
      clearConfirmationInfo: () => set({ confirmationInfo: [] }),
    }),
    {
      name: 'confirmation-info-storage', // Key used in AsyncStorage
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

export default useConfirmationInfoStore;
