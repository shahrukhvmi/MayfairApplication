// store/useShipmentCountries.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useShipmentCountries = create(
  persist(
    (set) => ({
      shipmentCountries: null,
      setShipmentCountries: (shipmentCountries) => set({ shipmentCountries }),
      clearShipmentCountries: () => set({ shipmentCountries: null }),
    }),
    {
      name: 'shipment-countries',
      storage: {
        getItem: async (key) => await AsyncStorage.getItem(key),
        setItem: async (key, value) => await AsyncStorage.setItem(key, value),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);

export default useShipmentCountries;
