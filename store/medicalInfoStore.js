// store/useMedicalInfoStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMedicalInfoStore = create(
  persist(
    set => ({
      medicalInfo: [],
      setMedicalInfo: medicalInfo => set({medicalInfo}),
      clearMedicalInfo: () => set({medicalInfo: []}),
    }),
    {
      name: 'medical-info-storage', // AsyncStorage key
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
        if (!Array.isArray(state?.medicalInfo)) {
          state.medicalInfo = [];
        }
        return {...persisted, state};
      },
    },
  ),
);

export default useMedicalInfoStore;
