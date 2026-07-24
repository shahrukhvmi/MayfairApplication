// store/useImageUploadStore.js

import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useImageUploadStore = create(
  persist(
    set => ({
      imageUploaded: false,
      setImageUploaded: status => set({imageUploaded: status}),
    }),
    {
      name: 'image-upload-storage', // Key in AsyncStorage
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
      partialize: state => ({imageUploaded: state.imageUploaded}), // Persist only this field
    },
  ),
);

export default useImageUploadStore;
