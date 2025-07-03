// store/useCouponStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCouponStore = create(
  persist(
    (set) => ({
      Coupon: null,
      setCoupon: (Coupon) => set({ Coupon }),
      clearCoupon: () => set({ Coupon: null }),
    }),
    {
      name: 'coupon-storage', // Key in AsyncStorage
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

export default useCouponStore;
