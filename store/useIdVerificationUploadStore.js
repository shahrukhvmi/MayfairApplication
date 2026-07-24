// store/useIdVerificationUploadStore.js

import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useIdVerificationUploadStore = create(
  persist(
    set => ({
      idVerificationUpload: false,
      setIdVerificationUpload: status => set({idVerificationUpload: status}),
    }),
    {
      name: 'id-verification-image-storage', // Key in AsyncStorage
      storage: {
        getItem: async key => {
          const val = await AsyncStorage.getItem(key);
          return val ? JSON.parse(val) : null;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: async key => {
          await AsyncStorage.removeItem(key);
        },
      },
      partialize: state => ({
        idVerificationUpload: state.idVerificationUpload,
      }), // Only persist this field
    },
  ),
);

export default useIdVerificationUploadStore;
