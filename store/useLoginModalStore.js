// store/useLoginModalStore.js

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MODAL_KEY = 'showLoginModal';

const useLoginModalStore = create((set) => ({
  showLoginModal: false,

  openLoginModal: async () => {
    await AsyncStorage.setItem(MODAL_KEY, 'true');
    set({ showLoginModal: true });
  },

  closeLoginModal: async () => {
    await AsyncStorage.setItem(MODAL_KEY, 'false');
    set({ showLoginModal: false });
  },

  // Initialize state from AsyncStorage
  initialize: async () => {
    try {
      const storedValue = await AsyncStorage.getItem(MODAL_KEY);
      if (storedValue === 'true') {
        set({ showLoginModal: true });
      } else {
        set({ showLoginModal: false });
      }
    } catch (e) {
      // error reading value, fallback to false
      set({ showLoginModal: false });
    }
  },
}));

export default useLoginModalStore;
