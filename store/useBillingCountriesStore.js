// store/useBillingCountries.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useBillingCountries = create(
  persist(
    set => ({
      billingCountries: null,
      setBillingCountries: billingCountries => set({billingCountries}),
      clearBillingCountries: () => set({billingCountries: null}),
    }),
    {
      name: 'billing-countries', // AsyncStorage key
      storage: {
        getItem: async key => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
      version: 1,
      migrate: (state, fromVersion) => {
        if (fromVersion < 1) {
          // Normalize legacy shapes
          if (typeof state?.billingCountries === 'string') {
            state.billingCountries = null;
          }
        }
        return state;
      },
    },
  ),
);

export default useBillingCountries;
