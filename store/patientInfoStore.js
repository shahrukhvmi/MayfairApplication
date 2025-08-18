// // store/usePatientInfoStore.js

// import {create} from 'zustand';
// import {persist} from 'zustand/middleware';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const usePatientInfoStore = create(
//   persist(
//     set => ({
//       patientInfo: null,
//       setPatientInfo: patientInfo => set({patientInfo}),
//       clearPatientInfo: () => set({patientInfo: null}),
//     }),
//     {
//       name: 'patient-info-storage', // Key in AsyncStorage
//       storage: {
//         getItem: async key => {
//           const value = await AsyncStorage.getItem(key);
//           return value;
//         },
//         setItem: async (key, value) => {
//           await AsyncStorage.setItem(key, value);
//         },
//         removeItem: async key => {
//           await AsyncStorage.removeItem(key);
//         },
//       },
//     },
//   ),
// );

// export default usePatientInfoStore;

import {create} from 'zustand';
import {persist} from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

const usePatientInfoStore = create(
  persist(
    set => ({
      patientInfo: null,
      setPatientInfo: patientInfo => set({patientInfo}),
      clearPatientInfo: () => set({patientInfo: null}),
    }),
    {
      name: 'patient-info-storage',
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
    },
  ),
);

export default usePatientInfoStore;
