"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext<any>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // Pakia data kutoka LocalStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem("BahmadCart");
      if (savedCart) {
        try {
          setCartItems(JSON.parse(savedCart));
        } catch (e) {
          console.error("Cart loading error", e);
        }
      }
    }
  }, []);

  // Hifadhi data kwenye LocalStorage mabadiliko yakitokea
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem("BahmadCart", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  // MPYA: Function ya kuangalia kama bei ya jumlaitumike
  // Hii inasaidia kujua bei gani itumike kwa item moja kulingana na quantity yake
  const getDynamicPrice = (item: any) => {
    const minQty = item.wholesale_min_qty || 6; // Default ni 6 kama haijawekwa
    // Kama item ina bei ya jumla NA quantity imefika kiwango
    if (item.wholesale_price && item.quantity >= minQty) {
      return item.wholesale_price;
    }
    return item.price; // Vinginevyo tumia bei ya kawaida
  };

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

  // Function ya kufuta kila kitu kwa mkupuo mmoja
  const clearCart = () => {
    setCartItems([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem("BahmadCart");
    }
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  
  // MODIFIED: Subtotal sasa inatumia bei ya jumla inapobidi
  const subtotal = cartItems.reduce((acc, item) => {
    const activePrice = getDynamicPrice(item); // Pata bei sahihi (Jumla au Reja reja)
    return acc + (activePrice * item.quantity);
  }, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      cartCount, 
      subtotal, 
      setCartItems, 
      clearCart,
      getDynamicPrice // Tume-expose hii ili uitumie kwenye Cart Page kuonyesha kama offer imekubali
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  
  if (!context) {
    return {
      cartItems: [],
      cartCount: 0,
      subtotal: 0,
      addToCart: () => {},
      removeFromCart: () => {},
      updateQuantity: () => {},
      setCartItems: () => {},
      clearCart: () => {},
      getDynamicPrice: () => 0 // Default return
    };
  }
  return context;
};