// store/useShippingOrBillingStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useShippingOrBillingStore = create(
  persist(
    (set) => ({
      shipping: null,
      billing: null,
      billingSameAsShipping: false, // ✅ Preserved

      setShipping: (info) => set({ shipping: info }),
      setBilling: (info) => set({ billing: info }),
      setBillingSameAsShipping: (status) => set({ billingSameAsShipping: status }),

      clearShipping: () => set({ shipping: null }),
      clearBilling: () => set({ billing: null }),
    }),
    {
      name: 'shipping-billing-storage', // Key in AsyncStorage
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

export default useShippingOrBillingStore;
