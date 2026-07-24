// store/useCheckoutStep.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCheckoutStep = create(
  persist(
    (set) => ({
      step: 1,
      setStep: (step) => set({ step }),
      resetStep: () => set({ step: 1 }),
    }),
    {
      name: 'checkout-step-storage',
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

export default useCheckoutStep;
