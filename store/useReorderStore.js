// store/useReorder.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReorder = create(
  persist(
    (set) => ({
      reorder: false,
      reorderStatus: false,

      setReorder: (status) => set({ reorder: status }),
      setReorderStatus: (status) => set({ reorderStatus: status }),

      resetReorder: () => set({ reorder: false }),
      resetReorderStatus: () => set({ reorderStatus: false }), // ✅ fixed from reorder to reorderStatus
    }),
    {
      name: 'reorder-status',
      storage: {
        getItem: async (key) => await AsyncStorage.getItem(key),
        setItem: async (key, value) => await AsyncStorage.setItem(key, value),
        removeItem: async (key) => await AsyncStorage.removeItem(key),
      },
    }
  )
);

export default useReorder;
