// store/useConfirmationQuestionsStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useConfirmationQuestionsStore = create(
  persist(
    set => ({
      confirmationQuestions: [],
      setConfirmationQuestions: confirmationQuestions =>
        set({confirmationQuestions}),
      clearConfirmationQuestions: () => set({confirmationQuestions: []}),
    }),
    {
      name: 'confirmation-questions-storage', // AsyncStorage key
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
        if (fromVersion < 1 || !Array.isArray(state?.confirmationQuestions)) {
          state.confirmationQuestions = Array.isArray(
            state?.confirmationQuestions,
          )
            ? state.confirmationQuestions
            : [];
        }
        return state;
      },
    },
  ),
);

export default useConfirmationQuestionsStore;
