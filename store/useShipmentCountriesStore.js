// store/useShipmentCountries.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useShipmentCountries = create(
  persist(
    set => ({
      shipmentCountries: null,
      setShipmentCountries: shipmentCountries => set({shipmentCountries}),
      clearShipmentCountries: () => set({shipmentCountries: null}),
    }),
    {
      name: 'shipment-countries',
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
          // Normalize any legacy/string shapes
          if (typeof state?.shipmentCountries === 'string') {
            state.shipmentCountries = null;
          }
        }
        return state;
      },
    },
  ),
);

export default useShipmentCountries;
