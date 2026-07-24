// store/useReorder.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useReorder = create(
  persist(
    set => ({
      reorder: false,
      reorderStatus: false,

      setReorder: status => set({reorder: status}),
      setReorderStatus: status => set({reorderStatus: status}),

      resetReorder: () => set({reorder: false}),
      resetReorderStatus: () => set({reorderStatus: false}), // ✅ fixed from reorder to reorderStatus
    }),
    {
      name: 'reorder-status',
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
          if (typeof state?.reorder !== 'boolean') state.reorder = false;
          if (typeof state?.reorderStatus !== 'boolean')
            state.reorderStatus = false;
        }
        return state;
      },
    },
  ),
);

export default useReorder;
