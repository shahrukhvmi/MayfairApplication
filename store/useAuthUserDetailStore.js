import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const zustandStorage = {
  getItem: (name) => AsyncStorage.getItem(name),
  setItem: (name, value) => AsyncStorage.setItem(name, value),
  removeItem: (name) => AsyncStorage.removeItem(name),
};

const useAuthUserDetailStore = create(
  persist(
    (set) => ({
      authUserDetail: null,
      setAuthUserDetail: (authUserDetail) => set({ authUserDetail }),
      clearAuthUserDetail: () => set({ authUserDetail: null }),
    }),
    {
      name: 'auth-user-storage',
      storage: zustandStorage,
    }
  )
);

export default useAuthUserDetailStore;
