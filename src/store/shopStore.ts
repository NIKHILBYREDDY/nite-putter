import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isLikelyValidPromo } from '../lib/utils/promo';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  inStock: boolean;
  stockCount?: number;
  rating: number;
  reviewCount: number;
  features?: string[];
  specifications?: Record<string, string>;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId?: string;
  items: OrderItem[];
  subtotal: number;
  discount?: number;
  shipping: number;
  tax: number;
  total: number;
  promoCodeUsed?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'confirmed';
  shippingAddress?: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod?: {
    type: 'card' | 'paypal' | 'apple_pay';
    cardLast4?: string;
  };
  createdAt: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

interface ShopState {
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  isLoading: boolean;
  error: string | null;
  selectedProduct: Product | null;
}

interface ShopActions {
  fetchProducts: () => Promise<void>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  checkout: (promoCode?: string) => Promise<void>;
  fetchOrders: () => Promise<void>;
  setSelectedProduct: (product: Product | null) => void;
  clearError: () => void;
}

type ShopStore = ShopState & ShopActions;

// Mock products data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Nite Putter Pro',
    description: 'Professional LED golf putter with customizable colors and effects',
    price: 299.99,
    images: ['https://via.placeholder.com/300x300', 'https://via.placeholder.com/300x300'],
    category: 'Putters',
    inStock: true,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: 'Glow Ball Set (12 pack)',
    description: 'Premium LED golf balls that sync with your putter',
    price: 89.99,
    images: ['https://via.placeholder.com/300x300'],
    category: 'Balls',
    inStock: true,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '3',
    name: 'Nite Cup Markers',
    description: 'Smart cup markers with customizable LED effects',
    price: 149.99,
    images: ['https://via.placeholder.com/300x300'],
    category: 'Accessories',
    inStock: true,
    rating: 4.7,
    reviewCount: 56,
  },
];

export const useShopStore = create<ShopStore>()(
  persist(
    (set, get) => ({
      // State
      products: [],
      cart: [],
      orders: [],
      isLoading: false,
      error: null,
      selectedProduct: null,

      // Actions
      fetchProducts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with real API later
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          set({
            products: mockProducts,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to fetch products',
          });
        }
      },

      addToCart: (product: Product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            cart: [...cart, { product, quantity }],
          });
        }
      },

      removeFromCart: (productId: string) => {
        const { cart } = get();
        set({
          cart: cart.filter(item => item.product.id !== productId),
        });
      },

      updateCartQuantity: (productId: string, quantity: number) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          cart: cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          ),
        });
      },

      clearCart: () => {
        set({ cart: [] });
      },

      checkout: async (_promoCode?: string) => {
        const { cart } = get();
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with real API later
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
          // Apply 10% off for valid promo OR referral code
          const isValid = _promoCode ? isLikelyValidPromo(_promoCode) : false;
          const discount = isValid ? subtotal * 0.10 : 0;
          const discountedSubtotal = Math.max(0, subtotal - discount);
          const shipping = discountedSubtotal > 50 ? 0 : 9.99; // Free shipping over $50
          const tax = discountedSubtotal * 0.08; // 8% tax
          const total = discountedSubtotal + shipping + tax;
          
          // Convert CartItem[] to OrderItem[]
          const orderItems: OrderItem[] = cart.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            price: item.product.price,
          }));
          
          const newOrder: Order = {
            id: Date.now().toString(),
            items: orderItems,
            subtotal,
            shipping,
            tax,
            total,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...(isValid ? { discount } : {}),
            ...(isValid && _promoCode ? { promoCodeUsed: _promoCode.trim().toUpperCase() } : {}),
          };
          
          set(state => ({
            orders: [newOrder, ...state.orders],
            cart: [],
            isLoading: false,
            error: null,
          }));
        } catch (error) {
          set({
            isLoading: false,
            error: 'Checkout failed',
          });
        }
      },

      fetchOrders: async () => {
        set({ isLoading: true, error: null });
        
        try {
          // Mock API call - replace with real API later
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Orders are already in state from checkout
          set({
            isLoading: false,
            error: null,
          });
        } catch (error) {
          set({
            isLoading: false,
            error: 'Failed to fetch orders',
          });
        }
      },

      setSelectedProduct: (product: Product | null) => {
        set({ selectedProduct: product });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'shop-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        cart: state.cart,
        orders: state.orders,
      }),
    }
  )
);
