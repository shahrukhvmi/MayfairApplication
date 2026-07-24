// store/usePasswordReset.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePasswordReset = create(
  persist(
    set => ({
      isPasswordReset: true,
      showResetPassword: true,

      setIsPasswordReset: isPasswordReset => set({isPasswordReset}),
      setShowResetPassword: showResetPassword => set({showResetPassword}),

      clearIsPasswordReset: () => set({isPasswordReset: false}),
      clearShowResetPassword: () => set({showResetPassword: false}),
    }),
    {
      name: 'user-password-reset',
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
        if (fromVersion < 1) {
          // Coerce legacy non-boolean shapes (e.g., "true"/"false", null)
          if (typeof state?.isPasswordReset !== 'boolean') {
            state.isPasswordReset =
              state?.isPasswordReset === true ||
              state?.isPasswordReset === 'true';
          }
          if (typeof state?.showResetPassword !== 'boolean') {
            state.showResetPassword =
              state?.showResetPassword === true ||
              state?.showResetPassword === 'true';
          }
        }
        return state;
      },
    },
  ),
);

export default usePasswordReset;
