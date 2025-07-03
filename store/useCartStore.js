// store/useCartStore.js

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getCartType from '../config/helperFunction';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: {
        doses: [],
        addons: [],
      },
      totalDoses: 0,
      totalAddons: 0,
      totalAmount: 0,
      checkOut: 0,
      orderId: 0,

      addToCart: (product) => {
        const state = get();
        const type = getCartType(product.type); // 'doses' or 'addons'
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === product.id);

        const newItems = [...currentItems];
        let quantityIncrement = 1;
        let priceIncrement = product.price;

        if (existingItem) {
          if (existingItem.qty < product.allowed) {
            existingItem.qty++;
            existingItem.totalPrice += product.price;
          } else {
            return;
          }
        } else {
          const updatedItem = {
            ...product,
            qty: 1,
            totalPrice: product.price,
            isSelected: true,
          };
          newItems.push(updatedItem);
        }

        set({
          items: {
            ...state.items,
            [type]: newItems,
          },
          totalDoses: type === 'doses' ? state.totalDoses + quantityIncrement : state.totalDoses,
          totalAddons: type === 'addons' ? state.totalAddons + quantityIncrement : state.totalAddons,
          totalAmount: state.totalAmount + priceIncrement,
        });
      },

      setCheckOut: (checkOut) => set({ checkOut }),
      setOrderId: (orderId) => set({ orderId }),

      removeItemCompletely: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === 'addon' ? 'addons' : 'doses';
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        const updatedItems = currentItems.filter((item) => item.id !== id);
        const quantityToRemove = existingItem.qty;
        const amountToRemove = existingItem.totalPrice;

        set({
          items: {
            ...state.items,
            [type]: updatedItems,
          },
          totalDoses: type === 'doses' ? state.totalDoses - quantityToRemove : state.totalDoses,
          totalAddons: type === 'addons' ? state.totalAddons - quantityToRemove : state.totalAddons,
          totalAmount: state.totalAmount - amountToRemove,
        });
      },

      removeFromCart: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === 'addon' ? 'addons' : 'doses';
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        const updatedItems =
          existingItem.qty === 1
            ? currentItems.filter((item) => item.id !== id)
            : currentItems.map((item) => {
                if (item.id === id) {
                  item.qty--;
                  item.totalPrice -= item.price;
                }
                return item;
              });

        set({
          items: {
            ...state.items,
            [type]: updatedItems,
          },
          totalDoses: type === 'doses' ? state.totalDoses - 1 : state.totalDoses,
          totalAddons: type === 'addons' ? state.totalAddons - 1 : state.totalAddons,
          totalAmount: state.totalAmount - existingItem.price,
        });
      },

      increaseQuantity: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === 'addon' ? 'addons' : 'doses';
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        existingItem.qty++;
        existingItem.totalPrice += existingItem.price;

        set({
          items: {
            ...state.items,
            [type]: [...currentItems],
          },
          totalAmount: state.totalAmount + existingItem.price,
        });
      },

      decreaseQuantity: (id, typeRaw) => {
        const state = get();
        const type = typeRaw?.toLowerCase() === 'addon' ? 'addons' : 'doses';
        const currentItems = state.items[type] || [];

        const existingItem = currentItems.find((item) => item.id === id);
        if (!existingItem) return;

        if (existingItem.qty > 1) {
          existingItem.qty--;
          existingItem.totalPrice -= existingItem.price;

          set({
            items: {
              ...state.items,
              [type]: [...currentItems],
            },
            totalAmount: state.totalAmount - existingItem.price,
          });
        } else {
          set({
            items: {
              ...state.items,
              [type]: currentItems.filter((item) => item.id !== id),
            },
            totalAmount: state.totalAmount - existingItem.price,
          });
        }
      },

      clearCart: () => {
        set({
          items: {
            doses: [],
            addons: [],
          },
          totalDoses: 0,
          totalAddons: 0,
          totalAmount: 0,
        });
      },

      clearCheckOutClear: () => set({ checkOut: null }),
    }),
    {
      name: 'cart-storage',
      storage: {
        getItem: async (key) => {
          const value = await AsyncStorage.getItem(key);
          return value;
        },
        setItem: async (key, value) => {
          await AsyncStorage.setItem(key, value);
        },
        removeItem: async (key) => {
          await AsyncStorage.removeItem(key);
        },
      },
    }
  )
);

export default useCartStore;
