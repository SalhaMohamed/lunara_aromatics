"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

// Context inaanzishwa ikiwa tupu
const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Jaribu kuokoa data kutoka LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("lunaraCart");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Cart error", e);
        }
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("lunaraCart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const addToCart = (product: any) => {
    setCartItems((prev) => {
      const exists = prev.find((item) => item.id === product.id && item.size === product.size);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id && item.size === product.size
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }
      return [...prev, product];
    });
  };

  const removeFromCart = (id: string, size: string) => {
    setCartItems((prev) => prev.filter((item) => !(item.id === id && item.size === size)));
  };

  const updateQuantity = (id: string, size: string, delta: number) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.size === size
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, cartCount, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

// HAPA NDIPO PENYE UCHAWI:
// Tumeondoa "throw new Error" kabisa. Hakuna mstari wa 73 wa error hapa.
export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    // Rudisha data feki ili isilete crash wakati inaload
    return {
      cartItems: [],
      cartCount: 0,
      subtotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {}
    };
  }
  return context;
};