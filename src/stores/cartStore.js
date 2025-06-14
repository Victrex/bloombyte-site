import { atom } from 'nanostores';

export const cartItems = atom([]);
export const isCartOpen = atom(false);

// Función para cargar carrito desde localStorage
function loadCartFromStorage() {
  if (typeof window !== 'undefined') {
    try {
      const savedCart = localStorage.getItem('bloom-bite-cart');
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        cartItems.set(parsedCart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      localStorage.removeItem('bloom-bite-cart');
    }
  }
}

// Función para guardar carrito en localStorage
function saveCartToStorage(items) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bloom-bite-cart', JSON.stringify(items));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }
}

// Inicializar carrito
loadCartFromStorage();

// Suscribirse a cambios en el carrito
cartItems.subscribe((items) => {
  saveCartToStorage(items);
});

export function addToCart(product) {
  const currentItems = cartItems.get();
  const existingItem = currentItems.find(item => item.id === product.id);
  
  if (existingItem) {
    // Incrementar cantidad
    cartItems.set(
      currentItems.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  } else {
    // Agregar nuevo producto
    cartItems.set([...currentItems, { ...product, quantity: 1 }]);
  }
  
  // Mostrar notificación
  showNotification('Producto agregado al carrito');
  
  // Abrir carrito
  isCartOpen.set(true);
}

export function removeFromCart(productId) {
  const currentItems = cartItems.get();
  cartItems.set(currentItems.filter(item => item.id !== productId));
  
  showNotification('Producto eliminado del carrito');
}

export function updateQuantity(productId, quantity) {
  if (quantity <= 0) {
    removeFromCart(productId);
    return;
  }
  
  const currentItems = cartItems.get();
  cartItems.set(
    currentItems.map(item =>
      item.id === productId
        ? { ...item, quantity }
        : item
    )
  );
}

export function clearCart() {
  cartItems.set([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem('bloom-bite-cart');
  }
}

export function getCartTotal() {
  const items = cartItems.get();
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function getCartItemsCount() {
  const items = cartItems.get();
  return items.reduce((count, item) => count + item.quantity, 0);
}

export function toggleCart() {
  isCartOpen.set(!isCartOpen.get());
}

// Función para reinicializar la store después de navegación
export function initializeCart() {
  loadCartFromStorage();
}

// Función auxiliar para mostrar notificaciones
function showNotification(message) {
  if (typeof window !== 'undefined') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = 'fixed bottom-4 right-4 bg-pink-500 text-white px-6 py-3 rounded-full shadow-lg z-50 animate-slide-in';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
      notification.classList.add('animate-slide-out');
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
}