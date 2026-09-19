import { create } from 'zustand';

type CartItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

type OrderStore = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (menuItemId: string) => void;
  clear: () => void;
};

export const useOrderStore = create<OrderStore>((set) => ({
  items: [],
  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((cartItem) => cartItem.menuItemId === item.menuItemId);
      if (existing) {
        return {
          items: state.items.map((cartItem) =>
            cartItem.menuItemId === item.menuItemId
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem,
          ),
        };
      }

      return {
        items: [...state.items, { ...item, quantity: 1 }],
      };
    }),
  removeItem: (menuItemId) =>
    set((state) => ({
      items: state.items.filter((item) => item.menuItemId !== menuItemId),
    })),
  clear: () => set({ items: [] }),
}));
