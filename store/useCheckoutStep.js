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

export default useCheckoutStep;
