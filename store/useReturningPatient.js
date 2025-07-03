// store/useReturning.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReturning = create(
  persist(
    (set) => ({
      isReturningPatient: false,

      setIsReturningPatient: (status) => set({ isReturningPatient: status }),
      resetIsReturningPatient: () => set({ isReturningPatient: false }),
    }),
    {
      name: 'is-returning-patient',
      storage: {
        getItem: async (key) => await AsyncStorage.getItem(key),
        setItem: async (key, value) => await AsyncStorage.setItem(key, value),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);

export default useReturning;
