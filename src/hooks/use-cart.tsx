'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantityInGrams: number) => void;
  updateQuantity: (productId: string, quantityInGrams: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('mercado-vecinal-cart');
      if (storedCart) {
        setCartItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      // Optionally, clear the broken cart data
      // localStorage.removeItem('mercado-vecinal-cart');
    }
  }, []);

  useEffect(() => {
    try {
        localStorage.setItem('mercado-vecinal-cart', JSON.stringify(cartItems));
    } catch (error) {
        console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToCart = useCallback((product: Product, quantityInGrams: number) => {
    if (quantityInGrams <= 0) return;

    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (quantityInGrams > product.stockInGrams) {
        toast({
            title: 'Stock insuficiente',
            description: `Solo quedan ${product.stockInGrams} g de ${product.name}.`,
            variant: 'destructive'
        });
        return prevItems;
      }

      if (existingItem) {
        const newQuantity = existingItem.quantityInGrams + quantityInGrams;
        if (newQuantity > product.stockInGrams) {
            toast({
                title: 'Stock insuficiente',
                description: `No puedes añadir más. Solo quedan ${product.stockInGrams} g de ${product.name}.`,
                variant: 'destructive'
            });
            return prevItems;
        }
        return prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantityInGrams: newQuantity }
            : item
        );
      }
      
      return [...prevItems, { product, quantityInGrams }];
    });
    toast({
        title: 'Producto añadido',
        description: `${quantityInGrams} g de ${product.name} añadidos al carrito.`,
    });
  }, [toast]);

  const updateQuantity = useCallback((productId: string, quantityInGrams: number) => {
    setCartItems(prevItems => {
      const itemToUpdate = prevItems.find(item => item.product.id === productId);
      if (itemToUpdate && quantityInGrams > itemToUpdate.product.stockInGrams) {
          toast({
              title: 'Stock insuficiente',
              description: `Solo quedan ${itemToUpdate.product.stockInGrams} g.`,
              variant: 'destructive'
          });
          return prevItems;
      }

      if (quantityInGrams <= 0) {
        return prevItems.filter(item => item.product.id !== productId);
      }
      return prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantityInGrams }
          : item
      );
    });
  }, [toast]);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  const cartTotal = cartItems.reduce((total, item) => {
    return total + item.product.pricePerGram * item.quantityInGrams;
  }, 0);

  const totalItems = cartItems.reduce((total, item) => total + 1, 0);

  const contextValue = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    totalItems,
  };

  return (
    <CartContext.Provider value={contextValue}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
