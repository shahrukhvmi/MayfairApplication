import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      hasHydrated: false,
      isImpersonationLogout: false,

      setToken: (token) => set({ token }),
      clearToken: () => set({ token: null }),
      setHasHydrated: () => set({ hasHydrated: true }),
      setIsImpersonationLogout: (flag) => set({ isImpersonationLogout: flag }),
    }),
    {
      name: 'auth-storage', // AsyncStorage key
      storage: {
        getItem: async (key) => {
          const jsonValue = await AsyncStorage.getItem(key);
          // parse JSON, or return null if nothing found
          return jsonValue != null ? jsonValue : null;
        },
        setItem: async (key, value) => {
          // value is a string already serialized by Zustand
          await AsyncStorage.setItem(key, value);
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.();
      },
    }
  )
);

export default useAuthStore;
