// store/useAuthUserDetailStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthUserDetailStore = create(
  persist(
    (set) => ({
      authUserDetail: null,
      setAuthUserDetail: (authUserDetail) => set({ authUserDetail }),
      clearAuthUserDetail: () => set({ authUserDetail: null }),
    }),
    {
      name: 'auth-user-storage', // Key for AsyncStorage
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, value);
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);

export default useAuthUserDetailStore;
