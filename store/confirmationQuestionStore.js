// store/useConfirmationQuestionsStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useConfirmationQuestionsStore = create(
  persist(
    (set) => ({
      confirmationQuestions: [],
      setConfirmationQuestions: (confirmationQuestions) => set({ confirmationQuestions }),
      clearConfirmationQuestions: () => set({ confirmationQuestions: [] }),
    }),
    {
      name: 'confirmation-questions-storage', // Key in AsyncStorage
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

export default useConfirmationQuestionsStore;
