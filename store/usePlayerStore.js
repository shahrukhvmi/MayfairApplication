import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePlayerStore = create(
  persist(
    set => ({
      playerId: null,
      setPlayerId: id => set({playerId: id}),
      clearPlayerId: () => set({playerId: null}),
    }),
    {
      name: 'player-id-store',
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
    },
  ),
);

export default usePlayerStore;
