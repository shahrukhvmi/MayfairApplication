// store/usePasswordReset.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePasswordReset = create(
  persist(
    (set) => ({
      isPasswordReset: true,
      showResetPassword: true,

      setIsPasswordReset: (isPasswordReset) => set({ isPasswordReset }),
      setShowResetPassword: (showResetPassword) => set({ showResetPassword }),

      clearIsPasswordReset: () => set({ isPasswordReset: false }),
      clearShowResetPassword: () => set({ showResetPassword: false }),
    }),
    {
      name: 'user-password-reset',
      storage: {
        getItem: async (key) => {
          return await AsyncStorage.getItem(key);
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

export default usePasswordReset;
