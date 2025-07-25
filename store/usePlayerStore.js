import {create} from 'zustand';
import {persist} from 'zustand/middleware';

const usePlayerStore = create(
  persist(
    set => ({
      playerId: null,
      setPlayerId: id => set({playerId: id}),
      clearPlayerId: () => set({playerId: null}),
    }),
    {
      name: 'player-id-store', // key in AsyncStorage
      getStorage: () =>
        require('@react-native-async-storage/async-storage').default,
    },
  ),
);

export default usePlayerStore;
