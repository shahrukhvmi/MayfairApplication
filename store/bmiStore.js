// store/useBmiStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useBmiStore = create(
  persist(
    (set) => ({
      bmi: '',
      setBmi: (bmi) => set({ bmi }),
      clearBmi: () => set({ bmi: null }),
    }),
    {
      name: 'bmi-storage', // AsyncStorage key
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

export default useBmiStore;
