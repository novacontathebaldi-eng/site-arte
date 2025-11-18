'use client';

import React, { useEffect } from 'react';
import { useCartStore } from '@/store/cartStore';

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { loadCart } = useCartStore();

  useEffect(() => {
    loadCart();
  }, [loadCart]);

  return <>{children}</>;
};