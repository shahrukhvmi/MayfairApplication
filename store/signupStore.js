import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const useSignupStore = create(
  persist(
    (set) => ({
      firstName: '',
      lastName: '',
      email: '',
      confirmationEmail: '',

      setFirstName: (firstName) => set({ firstName }),
      setLastName: (lastName) => set({ lastName }),
      setEmail: (email) => set({ email }),
      setConfirmationEmail: (confirmationEmail) => set({ confirmationEmail }),

      clearFirstName: () => set({ firstName: '' }),
      clearLastName: () => set({ lastName: '' }),
      clearEmail: () => set({ email: '' }),
      clearConfirmationEmail: () => set({ confirmationEmail: '' }),
    }),
    {
      name: 'signup-storage',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);

export default useSignupStore;
