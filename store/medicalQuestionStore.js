// store/useMedicalQuestionsStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useMedicalQuestionsStore = create(
  persist(
    set => ({
      medicalQuestions: [],
      setMedicalQuestions: medicalQuestions => set({medicalQuestions}),
      clearMedicalQuestions: () => set({medicalQuestions: []}),
    }),
    {
      name: 'medical-questions-storage',
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

export default useMedicalQuestionsStore;
