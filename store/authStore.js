// store/useAuthStore.js

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated?.();
      },
    }
  )
);

export default useAuthStore;
