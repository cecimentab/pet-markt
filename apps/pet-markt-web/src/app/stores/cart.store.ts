import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';
import { Product } from '../interfaces/product';
import { computed } from '@angular/core';

const CART_LOCALSTORAGE_KEY = 'pet_markt_cart';
type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
};
const initialState: CartState = {
  items: [],
};
export const CartStore = signalStore(
  {
    providedIn: 'root',
  },
  withState(() => {
    if ('localStorage' in globalThis) {
      return {
        ...initialState,
        items: JSON.parse(
          localStorage.getItem(CART_LOCALSTORAGE_KEY) ?? '[]',
        ) as CartItem[],
      };
    }
    return initialState;
  }),
  withComputed((store) => ({
    totalItems: computed(() =>
      store.items().reduce((acc, item) => {
        return acc + item.quantity;
      }, 0),
    ),
  })),
  withComputed((store) => ({
    totalAmount: computed(() =>
      store.items().reduce((acc, item) => {
        return acc + item.quantity * item.price;
      }, 0),
    ),
  })),
  withMethods((store) => ({
    addToCart(product: Product, quantity = 1) {
      const currentItems = store.items();
      const existingItem = currentItems.find(
        (cartItem: CartItem) => cartItem.id === product.id,
      );
      if (existingItem) {
        const updatedItems = store.items().map((cartItem: CartItem) => {
          if (cartItem.id === existingItem.id) {
            return {
              ...cartItem,
              quantity: cartItem.quantity + quantity,
            };
          }
          return cartItem;
        });
        patchState(store, {
          items: updatedItems,
        });
      } else {
        patchState(store, {
          items: [
            ...store.items(),
            {
              ...product,
              quantity,
            },
          ],
        });
      }
      localStorage.setItem(
        CART_LOCALSTORAGE_KEY,
        JSON.stringify(store.items()),
      );
    },
    updateQuantity(productId: string, quantity: number) {
      const updateItems = store
        .items()
        .map((item) => (item.id === productId ? { ...item, quantity } : item));
      patchState(store, { items: updateItems });
      localStorage.setItem(
        CART_LOCALSTORAGE_KEY,
        JSON.stringify(store.items()),
      );
    },
    removeFromCart(productId: string) {
      const updatedItems = store
        .items()
        .filter((item) => item.id !== productId);
      patchState(store, { items: updatedItems });
      localStorage.setItem(
        CART_LOCALSTORAGE_KEY,
        JSON.stringify(store.items()),
      );
    },
    clearStore() {
      patchState(store, { items: [] });
      localStorage.removeItem(CART_LOCALSTORAGE_KEY);
    },
  })),
);
