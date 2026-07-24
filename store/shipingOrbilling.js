// // store/useShippingOrBillingStore.js

// import { create } from 'zustand';
// import { persist } from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const useShippingOrBillingStore = create(
//   persist(
//     (set) => ({
//       shipping: null,
//       billing: null,
//       billingSameAsShipping: false, // ✅ Preserved

//       setShipping: (info) => set({ shipping: info }),
//       setBilling: (info) => set({ billing: info }),
//       setBillingSameAsShipping: (status) => set({ billingSameAsShipping: status }),

//       clearShipping: () => set({ shipping: null }),
//       clearBilling: () => set({ billing: null }),
//     }),
//     {
//       name: 'shipping-billing-storage', // Key in AsyncStorage
//       storage: {
//         getItem: async (key) => {
//           const value = await AsyncStorage.getItem(key);
//           return value;
//         },
//         setItem: async (key, value) => {
//           await AsyncStorage.setItem(key, value);
//         },
//         removeItem: async (key) => {
//           await AsyncStorage.removeItem(key);
//         },
//       },
//     }
//   )
// );

// export default useShippingOrBillingStore;

// store/useShippingOrBillingStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useShippingOrBillingStore = create(
  persist(
    set => ({
      shipping: null,
      billing: null,
      billingSameAsShipping: false,

      setShipping: info => set({shipping: info}),
      setBilling: info => set({billing: info}),
      setBillingSameAsShipping: status => set({billingSameAsShipping: status}),

      clearShipping: () => set({shipping: null}),
      clearBilling: () => set({billing: null}),
      clearAll: () =>
        set({shipping: null, billing: null, billingSameAsShipping: false}),
    }),
    {
      name: 'shipping-billing-storage',
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
      migrate: (persisted, _version) => {
        const state = persisted?.state ?? {};
        // Normalize any old shapes
        if (state.shipping === '') state.shipping = null;
        if (state.billing === '') state.billing = null;
        if (typeof state.billingSameAsShipping !== 'boolean') {
          state.billingSameAsShipping = false;
        }
        return {...persisted, state};
      },
    },
  ),
);

export default useShippingOrBillingStore;
