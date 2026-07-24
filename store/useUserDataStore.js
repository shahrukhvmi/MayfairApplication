import { create } from "zustand";
import { persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useUserDataStore = create(
  persist(
    (set) => ({
      userData: null,
      setUserData: (userData) => set({ userData }),
      clearUserData: () => set({ userData: null }),
    }),
    {
      name: "user-data-storage",
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);

export default useUserDataStore;
