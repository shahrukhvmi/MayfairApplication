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
      name: "user-data-storage", // unique storage key
      getStorage: () => AsyncStorage, // use AsyncStorage in React Native
    }
  )
);

export default useUserDataStore;
