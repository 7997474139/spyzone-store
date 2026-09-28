'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 1. పేజీ లోడ్ అయినప్పుడు LocalStorage నుండి సేవ్ అయిన Cart ఐటమ్స్ లోడ్ అవుతాయి
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('spy_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
    }
  }, []);

  // 2. Add to Cart ఫంక్షన్ (డేటా LocalStorage లో సేవ్ అవుతుంది)
  const addToCart = (product) => {
    setCart((prevCart) => {
      const updatedCart = [...prevCart, product];
      localStorage.setItem('spy_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // 3. Remove from Cart ఫంక్షన్
  const removeFromCart = (cartId) => {
    setCart((prevCart) => {
      const updatedCart = prevCart.filter(
        (item) => (item.cartId || item.id) !== cartId
      );
      localStorage.setItem('spy_cart', JSON.stringify(updatedCart));
      return updatedCart;
    });
  };

  // 4. Clear Cart (Checkout పూర్తయినప్పుడు)
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('spy_cart');
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);