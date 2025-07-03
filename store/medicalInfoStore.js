// store/useMedicalInfoStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMedicalInfoStore = create(
  persist(
    (set) => ({
      medicalInfo: [],
      setMedicalInfo: (medicalInfo) => set({ medicalInfo }),
      clearMedicalInfo: () => set({ medicalInfo: [] }),
    }),
    {
      name: 'medical-info-storage', // Key for AsyncStorage
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

export default useMedicalInfoStore;
