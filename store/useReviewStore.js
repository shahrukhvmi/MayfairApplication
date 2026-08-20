import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReviewStore = create(
  persist(
    set => ({
      review: false,
      orderId: null,

      setReview: val => set({review: val}),
      setOrderId: id => set({orderId: id}),
      clearReview: () => set({review: false, orderId: null}),
    }),
    {
      name: 'review-storage',
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

export default useReviewStore;
