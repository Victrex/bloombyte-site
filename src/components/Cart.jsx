import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { X, Plus, Minus, ShoppingCart, Trash2 } from 'lucide-react';
import { 
  cartItems, 
  isCartOpen, 
  updateQuantity, 
  removeFromCart, 
  clearCart, 
  getCartTotal, 
  getCartItemsCount,
  toggleCart 
} from '../stores/cartStore';
import ecommerceConfig from '../../public/ecommerce-config.json';

export default function Cart() {
  const items = useStore(cartItems);
  const open = useStore(isCartOpen);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  
  const total = getCartTotal();
  const itemsCount = getCartItemsCount();
  const { store } = ecommerceConfig;
  
  const deliveryFee = total >= store.freeDeliveryThreshold ? 0 : store.deliveryFee;
  const finalTotal = total + deliveryFee;
  
const handleCheckout = async (e) => {
  e.preventDefault();
  
  if (total < store.minimumOrder) {
    alert(`El pedido mínimo es de ${store.currency}${store.minimumOrder}`);
    return;
  }
  
  try {
    // 1. Primero guardar en la base de datos
    const orderData = {
      customer_name: customerName,
      customer_phone: customerPhone,
      items: items,
      total: finalTotal
    };
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la orden');
    }
    
    // 2. Luego enviar por WhatsApp
    let message = `${store.orderMessage}\n\n`;
    message += `👤 *Cliente:* ${customerName}\n`;
    message += `📱 *Teléfono:* ${customerPhone}\n\n`;
    message += `📋 *Productos:*\n`;
    
    items.forEach(item => {
      message += `• ${item.name} x${item.quantity} = ${store.currency}${(item.price * item.quantity).toFixed(2)}\n`;
    });
    
    message += `\n💰 *Subtotal:* ${store.currency}${total.toFixed(2)}`;
    if (deliveryFee > 0) {
      message += `\n🚚 *Envío:* ${store.currency}${deliveryFee.toFixed(2)}`;
    }
    message += `\n💳 *Total:* ${store.currency}${finalTotal.toFixed(2)}`;
    
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/${store.whatsappNumber}?text=${encodedMessage}`, '_blank');
    
    // 3. Limpiar carrito
    clearCart();
    toggleCart();
    setShowCheckout(false);
    setCustomerName('');
    setCustomerPhone('');
    
    alert('¡Tu pedido ha sido enviado! Te contactaremos pronto.');
    
  } catch (error) {
    console.error('Error:', error);
    alert('Error al procesar el pedido. Por favor intenta de nuevo.');
  }
};
  if (!open) return null;
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={() => toggleCart()}
      />
      
      {/* Cart Sidebar */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 transform transition-transform duration-300">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <ShoppingCart className="w-6 h-6 text-pink-500" />
              Tu Carrito ({itemsCount})
            </h2>
            <button
              onClick={() => toggleCart()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-6">
            {items.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">{ecommerceConfig.cartMessages.empty}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map(item => (
                  <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-300 to-orange-400 rounded-lg"></div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{item.name}</h3>
                        <p className="text-sm text-gray-600">{store.currency}{item.price}</p>
                        
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2 mt-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="px-3 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-full flex items-center justify-center hover:bg-gray-100"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Footer */}
          {items.length > 0 && (
            <div className="border-t p-6">
              {!showCheckout ? (
                <>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span>{store.currency}{total.toFixed(2)}</span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span>{store.currency}{deliveryFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-gray-800">
                      <span>Total</span>
                      <span>{store.currency}{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {total < store.minimumOrder && (
                    <p className="text-sm text-red-500 mb-4">
                      {ecommerceConfig.cartMessages.minimumOrder} {store.currency}{store.minimumOrder}
                    </p>
                  )}
                  
                  <button
                    onClick={() => setShowCheckout(true)}
                    disabled={total < store.minimumOrder}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceder al Pedido
                  </button>
                </>
              ) : (
                <form onSubmit={handleCheckout} className="space-y-4">
                  <h3 className="font-bold text-lg mb-4">Datos de contacto</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                      placeholder="Tu nombre"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-pink-500 focus:ring-2 focus:ring-pink-200"
                      placeholder="+504 0000-0000"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowCheckout(false)}
                      className="flex-1 border border-gray-300 text-gray-700 font-medium py-3 rounded-full hover:bg-gray-100"
                    >
                      Atrás
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold py-3 rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                    >
                      Enviar Pedido
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}