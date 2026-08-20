// store/useAbandonCardStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAbandonCardStore = create(
  persist(
    set => ({
      abandonCard: null, // { productId, fromEmail, type, eid }
      extra: null, // restore ke waqt jo dose auto-add karni hai

      setAbandonCard: data =>
        set(state => ({
          abandonCard: {
            ...state.abandonCard,
            ...data,
          },
        })),

      setExtra: data => set({extra: data}),

      clearAbandonCard: () => set({abandonCard: null, extra: null}),
    }),
    {
      name: 'abandon-card-storage',
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

export default useAbandonCardStore;
