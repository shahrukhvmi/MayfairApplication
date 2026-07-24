// store/useReorderBackProcessStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReorderBackProcessStore = create(
  persist(
    set => ({
      reorderBackProcess: false,
      setReorderBackProcess: value => set({reorderBackProcess: value}),
      clearReorderBackProcess: () => set({reorderBackProcess: false}),
    }),
    {
      name: 'reorder-back-process',
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
        if (fromVersion < 1 || typeof state?.reorderBackProcess !== 'boolean') {
          state.reorderBackProcess = !!state?.reorderBackProcess;
        }
        return state;
      },
    },
  ),
);

export default useReorderBackProcessStore;
