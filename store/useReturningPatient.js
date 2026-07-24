// store/useReturning.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReturning = create(
  persist(
    set => ({
      isReturningPatient: false,

      setIsReturningPatient: status => set({isReturningPatient: status}),
      resetIsReturningPatient: () => set({isReturningPatient: false}),
    }),
    {
      name: 'is-returning-patient',
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
          if (typeof state?.isReturningPatient !== 'boolean') {
            state.isReturningPatient = false;
          }
        }
        return state;
      },
    },
  ),
);

export default useReturning;
