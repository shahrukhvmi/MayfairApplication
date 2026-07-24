// store/useBmiStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useBmiStore = create(
  persist(
    set => ({
      // keep one consistent type; using null here
      bmi: null,
      setBmi: bmi => set({bmi}),
      clearBmi: () => set({bmi: null}),
    }),
    {
      name: 'bmi-storage', // AsyncStorage key
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
      // optional: version + migrate to normalize any old '' values
      version: 1,
      migrate: (persisted, _version) => {
        const state = persisted?.state ?? {};
        if (state?.bmi === '') state.bmi = null; // normalize previous empty-string BMI
        return {...persisted, state};
      },
    },
  ),
);

export default useBmiStore;
