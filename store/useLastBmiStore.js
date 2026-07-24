// store/useLastBmi.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useLastBmi = create(
  persist(
    set => ({
      lastBmi: null,
      setLastBmi: lastBmi => set({lastBmi}),
      clearLastBmi: () => set({lastBmi: null}),
    }),
    {
      name: 'last-bmi', // AsyncStorage key (kept as-is)
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
        // Normalize legacy shapes if any
        if (fromVersion < 1) {
          if (
            state &&
            typeof state.lastBmi === 'string' &&
            state.lastBmi.trim() === ''
          ) {
            state.lastBmi = null;
          }
        }
        return state;
      },
    },
  ),
);

export default useLastBmi;
