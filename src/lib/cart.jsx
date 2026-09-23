import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'hmf.cart.v1';

const readStorage = () => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStorage);
  const [isOpen, setOpen] = useState(false);
  const [lastAdded, setLastAdded] = useState(null);
  const [pendingStep, setPendingStep] = useState(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* modo privado / storage cheio — ignora */
    }
  }, [items]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  /* Funções estáveis: são usadas em efeitos de outros componentes e não podem
     mudar de identidade a cada render, senão o efeito roda sem necessidade. */
  const open = useCallback(() => setOpen(true), []);
  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const openCheckout = useCallback(() => {
    setPendingStep('checkout');
    setOpen(true);
  }, []);
  const clearPendingStep = useCallback(() => setPendingStep(null), []);

  const add = useCallback((product, qty = 1) => {
    setItems((current) => {
      const existing = current.find((i) => i.productId === product.id);
      if (existing) {
        return current.map((i) =>
          i.productId === product.id
            ? { ...i, qty: Math.min(i.qty + qty, product.stock ?? 99) }
            : i,
        );
      }
      return [
        ...current,
        {
          productId: product.id,
          name: product.name,
          price: product.finalPrice ?? product.price,
          unit: product.unit,
          image: product.image,
          slug: product.slug,
          shippingScope: product.shippingScope,
          stock: product.stock,
          qty,
        },
      ];
    });
    setLastAdded(product.name);
  }, []);

  const setQty = useCallback((productId, qty) => {
    setItems((current) =>
      qty <= 0
        ? current.filter((i) => i.productId !== productId)
        : current.map((i) => (i.productId === productId ? { ...i, qty: Math.min(qty, 99) } : i)),
    );
  }, []);

  const remove = useCallback((productId) => {
    setItems((current) => current.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const hasOnlyLocal = items.length > 0 && items.every((i) => i.shippingScope === 'local');
    const hasNational = items.some((i) => i.shippingScope !== 'local');
    return {
      items,
      count,
      subtotal,
      hasOnlyLocal,
      hasNational,
      isOpen,
      lastAdded,
      pendingStep,
      clearPendingStep,
      open,
      openCheckout,
      close,
      toggle,
      add,
      setQty,
      remove,
      clear,
    };
  }, [
    items,
    isOpen,
    lastAdded,
    pendingStep,
    clearPendingStep,
    open,
    openCheckout,
    close,
    toggle,
    add,
    setQty,
    remove,
    clear,
  ]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart precisa estar dentro de <CartProvider>');
  return context;
}
