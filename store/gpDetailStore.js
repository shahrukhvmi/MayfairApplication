// store/useGpDetailsStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useGpDetailsStore = create(
  persist(
    set => ({
      gpdetails: null,
      setGpDetails: gpdetails => set({gpdetails}),
      clearGpDetails: () => set({gpdetails: null}),
    }),
    {
      name: 'gpdetails-storage', // AsyncStorage key
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
    },
  ),
);

export default useGpDetailsStore;
