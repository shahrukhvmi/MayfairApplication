// store/useBillingCountries.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useBillingCountries = create(
  persist(
    (set) => ({
      billingCountries: null,
      setBillingCountries: (billingCountries) => set({ billingCountries }),
      clearBillingCountries: () => set({ billingCountries: null }),
    }),
    {
      name: 'billing-countries', // Key used in AsyncStorage
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

export default useBillingCountries;
