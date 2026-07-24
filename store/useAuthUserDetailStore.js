// store/useAuthUserDetailStore.js
import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// JSON-aware storage adapter (mirrors createJSONStorage behavior)
const zustandJsonStorage = {
  getItem: async name => {
    const str = await AsyncStorage.getItem(name);
    return str ? JSON.parse(str) : null;
  },
  setItem: async (name, value) => {
    await AsyncStorage.setItem(name, JSON.stringify(value));
  },
  removeItem: async name => {
    await AsyncStorage.removeItem(name);
  },
};

const useAuthUserDetailStore = create(
  persist(
    set => ({
      authUserDetail: null,
      setAuthUserDetail: authUserDetail => set({authUserDetail}),
      clearAuthUserDetail: () => set({authUserDetail: null}),
    }),
    {
      name: 'auth-user-storage',
      storage: zustandJsonStorage,
      // Optional: version + migration to normalize any old/bad data
      version: 1,
      migrate: (persisted, _version) => {
        const state = persisted?.state ?? {};
        if (typeof state?.authUserDetail === 'string') {
          // if an old string slipped in, reset it
          state.authUserDetail = null;
        }
        return {...persisted, state};
      },
    },
  ),
);

export default useAuthUserDetailStore;
