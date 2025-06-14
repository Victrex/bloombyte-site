import React, { useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { ShoppingCart } from 'lucide-react';
import { cartItems, toggleCart, getCartItemsCount } from '../stores/cartStore';

export default function CartButton() {
  const items = useStore(cartItems);
  const itemsCount = getCartItemsCount();
  
  // Forzar re-render en navegación
  useEffect(() => {
    const handlePageLoad = () => {
      // Forzar actualización del componente
      cartItems.set([...cartItems.get()]);
    };
    
    document.addEventListener('astro:page-load', handlePageLoad);
    
    return () => {
      document.removeEventListener('astro:page-load', handlePageLoad);
    };
  }, []);
  
  const handleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCart();
  };
  
  if (itemsCount === 0) return null;
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-gradient-to-r from-pink-500 to-orange-500 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-30 group"
    >
      <ShoppingCart className="w-6 h-6" />
      
      {/* Badge */}
      <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center animate-pulse">
        {itemsCount}
      </span>
      
      {/* Tooltip */}
      <span className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
        Ver carrito
      </span>
    </button>
  );
}