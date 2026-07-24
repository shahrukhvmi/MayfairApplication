// store/useReorderButtonStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReorderButtonStore = create(
  persist(
    set => ({
      isFromReorder: false,
      setIsFromReorder: value => set({isFromReorder: value}),
      clearFromReorder: () => set({isFromReorder: false}),
    }),
    {
      name: 'isFromReorder', // AsyncStorage key
      storage: {
        getItem: async key => {
          const item = await AsyncStorage.getItem(key);
          return item ? JSON.parse(item) : null;
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
        if (fromVersion < 1 || typeof state?.isFromReorder !== 'boolean') {
          state.isFromReorder = !!state?.isFromReorder;
        }
        return state;
      },
    },
  ),
);

export default useReorderButtonStore;
