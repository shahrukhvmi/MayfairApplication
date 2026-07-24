// store/useCouponStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCouponStore = create(
  persist(
    set => ({
      Coupon: null,
      setCoupon: Coupon => set({Coupon}),
      clearCoupon: () => set({Coupon: null}),
    }),
    {
      name: 'coupon-storage', // AsyncStorage key
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
          // normalize any legacy shapes
          if (typeof state?.Coupon === 'string' && !state.Coupon) {
            state.Coupon = null;
          }
        }
        return state;
      },
    },
  ),
);

export default useCouponStore;
