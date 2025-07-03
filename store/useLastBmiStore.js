// store/useLastBmi.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLastBmi = create(
  persist(
    (set) => ({
      lastBmi: null,
      setLastBmi: (lastBmi) => set({ lastBmi }),
      clearLastBmi: () => set({ lastBmi: null }),
    }),
    {
      name: 'last-bmi',
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

export default useLastBmi;
