// store/useCheckoutStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useCheckoutStore = create(
  persist(
    set => ({
      checkout: null,
      setCheckout: checkout => set({checkout}),
      clearCheckout: () => set({checkout: null}),
    }),
    {
      name: 'checkout-storage', // AsyncStorage key
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
      // optional: version + migrate to normalize any old data shape
      version: 1,
      migrate: (persisted, _version) => {
        const state = persisted?.state ?? {};
        if (typeof state?.checkout === 'string') state.checkout = null;
        return {...persisted, state};
      },
    },
  ),
);

export default useCheckoutStore;
