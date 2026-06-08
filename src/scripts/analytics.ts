type Gtag = (
  command: 'event' | 'config' | 'js',
  target: string | Date,
  params?: Record<string, unknown>
) => void;

type Product = {
  id: string | null;
  name: string | null;
  category?: string | null;
  variant?: string | null;
  price: number;
  currency: string;
  image?: string | null;
};

type CartItem = Product & {
  id: string;
  name: string;
  quantity: number;
};

type Order = {
  transaction_id: string;
  currency: string;
  value: number;
  cart_items_count: number;
  cart_total: number;
  items: ReturnType<typeof toItem>[];
};

declare global {
  interface Window {
    gtag?: Gtag;
    tastyfoodConfig?: {
      googleAnalyticsMeasurementId?: string;
    };
    tastyfoodAnalytics: {
      track: (name: string, params?: Record<string, unknown>) => void;
      productFrom: (element: Element) => Product;
      addToCart: (product: Product, source: string) => void;
      removeFromCart: (
        item: CartItem,
        quantity: number,
        source: string
      ) => void;
      viewCart: (cart: CartItem[]) => void;
      beginCheckout: (cart: CartItem[]) => void;
      submitOrder: (cart: CartItem[]) => void;
      purchase: () => void;
      cartParams: (cart: CartItem[]) => Record<string, unknown>;
    };
  }
}

const orderKey = 'tastyfood-pending-order';
const sentPurchasePrefix = 'tastyfood-purchase-sent:';

const measurementId = () => {
  return window.tastyfoodConfig?.googleAnalyticsMeasurementId || '';
};

const language = () => {
  return document.documentElement.lang || 'en';
};

const debugMode = () => {
  return new URLSearchParams(window.location.search).has('ga_debug');
};

const track = (name: string, params: Record<string, unknown> = {}) => {
  if (typeof window.gtag !== 'function') {
    return;
  }

  const id = measurementId();

  if (!id) {
    return;
  }

  window.gtag('event', name, {
    language: language(),
    send_to: id,
    debug_mode: debugMode(),
    ...params,
  });
};

const normalize = (value: string | null, fallback: string) => {
  return value && value.trim() ? value : fallback;
};

const productFrom = (element: Element): Product => {
  return {
    id: element.getAttribute('data-product-id'),
    name: element.getAttribute('data-product-name'),
    category: element.getAttribute('data-product-category'),
    variant: element.getAttribute('data-product-variant'),
    price: Number(element.getAttribute('data-product-price') || 0),
    currency: normalize(
      element.getAttribute('data-product-currency'),
      'EUR'
    ),
    image: element.getAttribute('data-product-image'),
  };
};

const toItem = (product: Product, quantity = 1) => {
  return {
    item_id: normalize(product.id, 'unknown'),
    item_name: normalize(product.name, 'Unknown item'),
    item_category: normalize(product.category || null, 'ossetian_pies'),
    item_variant: normalize(product.variant || null, 'whole_pie'),
    price: Number(product.price || 0),
    quantity,
  };
};

const cartParams = (cart: CartItem[]) => {
  const currency = cart[0]?.currency || 'EUR';
  const cartItemsCount = cart.reduce((sum, item) => {
    return sum + Number(item.quantity || 0);
  }, 0);
  const value = cart.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);

  return {
    currency,
    value,
    items: cart.map(item => toItem(item, Number(item.quantity || 0))),
    cart_items_count: cartItemsCount,
    cart_total: value,
  };
};

const transactionId = () => {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const storeOrder = (cart: CartItem[]) => {
  const params = cartParams(cart);
  const order: Order = {
    transaction_id: transactionId(),
    currency: String(params.currency || 'EUR'),
    value: Number(params.value || 0),
    cart_items_count: Number(params.cart_items_count || 0),
    cart_total: Number(params.cart_total || 0),
    items: params.items as Order['items'],
  };

  sessionStorage.setItem(orderKey, JSON.stringify(order));

  return order;
};

const readOrder = () => {
  try {
    return JSON.parse(sessionStorage.getItem(orderKey) || 'null') as Order;
  } catch {
    return null;
  }
};

const addToCart = (product: Product, source: string) => {
  track('add_to_cart', {
    currency: product.currency,
    value: Number(product.price || 0),
    items: [toItem(product)],
    source_section: source,
  });
};

const removeFromCart = (
  item: CartItem,
  quantity: number,
  source: string
) => {
  track('remove_from_cart', {
    currency: item.currency,
    value: Number(item.price || 0) * quantity,
    items: [toItem(item, quantity)],
    source_section: source,
  });
};

const viewCart = (cart: CartItem[]) => {
  if (cart.length === 0) {
    track('empty_cart_view', {
      page_type: 'cart',
      source_section: 'cart',
    });

    return;
  }

  track('view_cart', {
    page_type: 'cart',
    ...cartParams(cart),
  });
};

const beginCheckout = (cart: CartItem[]) => {
  track('begin_checkout', {
    page_type: 'cart',
    contact_method: 'form',
    delivery_method: 'pickup',
    ...cartParams(cart),
  });
};

const submitOrder = (cart: CartItem[]) => {
  const order = storeOrder(cart);

  track('form_submit_attempt', {
    form_name: 'order',
    page_type: 'cart',
    cart_total: order.cart_total,
  });
  track('generate_lead', {
    page_type: 'cart',
    contact_method: 'form',
    delivery_method: 'pickup',
    currency: order.currency,
    value: order.value,
    cart_items_count: order.cart_items_count,
    cart_total: order.cart_total,
    items: order.items,
  });
};

const purchase = () => {
  const order = readOrder();

  if (!order) {
    return;
  }

  const sentKey = `${sentPurchasePrefix}${order.transaction_id}`;

  if (sessionStorage.getItem(sentKey)) {
    return;
  }

  track('purchase', {
    page_type: 'thank_you',
    contact_method: 'form',
    delivery_method: 'pickup',
    ...order,
  });

  sessionStorage.setItem(sentKey, '1');
  sessionStorage.removeItem(orderKey);
};

window.tastyfoodAnalytics = {
  track,
  productFrom,
  addToCart,
  removeFromCart,
  viewCart,
  beginCheckout,
  submitOrder,
  purchase,
  cartParams,
};

export {};
