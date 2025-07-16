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
          return value;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, value);
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
    },
  ),
);

export default useReorderBackProcessStore;
