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
      name: 'isFromReorder',
      storage: {
        getItem: async key => {
          const item = await AsyncStorage.getItem(key);
          return item;
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

export default useReorderButtonStore;
