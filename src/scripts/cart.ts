import './analytics';
import { order } from '../lib/order';

type CartItem = {
  id: string;
  name: string;
  category?: string | null;
  variant?: string | null;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
};

type Product = Omit<CartItem, 'quantity'>;

declare global {
  interface Window {
    tastyfoodCart: {
      key: string;
      maxPies: number;
      read: () => CartItem[];
      write: (cart: CartItem[]) => void;
      add: (product: Product, source?: string) => void;
      updateCount: () => void;
    };
  }
}

const cartKey = 'tastyfood-cart';
const maxPies = order.maxPies;

const totalQuantity = (cart: CartItem[]) => {
  return cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);
};

const clampCart = (cart: CartItem[]) => {
  let rest = maxPies;

  return cart
    .map(item => {
      const quantity = Math.max(0, Number(item.quantity || 0));
      const nextQuantity = Math.min(quantity, rest);
      rest -= nextQuantity;

      return { ...item, quantity: nextQuantity };
    })
    .filter(item => item.quantity > 0);
};

const readCart = () => {
  try {
    return JSON.parse(localStorage.getItem(cartKey) || '[]') as CartItem[];
  } catch {
    return [];
  }
};

const updateCartCount = () => {
  const count = totalQuantity(readCart());

  document.querySelectorAll('[data-cart-count]').forEach(element => {
    element.textContent = String(count);

    if (element instanceof HTMLElement) {
      element.hidden = count === 0;
    }
  });
};

const writeCart = (cart: CartItem[]) => {
  const nextCart = clampCart(cart);

  localStorage.setItem(cartKey, JSON.stringify(nextCart));
  updateCartCount();
  window.dispatchEvent(new CustomEvent('tastyfood-cart-change', {
    detail: { cart: nextCart },
  }));
};

const addCartItem = (product: Product, source = 'unknown') => {
  const cart = readCart();
  const count = totalQuantity(cart);

  if (count >= maxPies) {
    return;
  }

  const item = cart.find(entry => entry.id === product.id);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  writeCart(cart);
  window.tastyfoodAnalytics.addToCart(product, source);
};

window.tastyfoodCart = {
  key: cartKey,
  maxPies,
  read: readCart,
  write: writeCart,
  add: addCartItem,
  updateCount: updateCartCount,
};

document.addEventListener('DOMContentLoaded', updateCartCount);
window.addEventListener('storage', () => {
  updateCartCount();
  window.dispatchEvent(new CustomEvent('tastyfood-cart-change', {
    detail: { cart: readCart() },
  }));
});
