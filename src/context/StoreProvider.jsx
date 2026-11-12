import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { StoreContext } from "./store-context";
import { useAuth } from "./useAuth";
import {
  addWishlistItem,
  getCart,
  getWishlist,
  removeWishlistItem,
  saveCart,
} from "../services/cartService";
import { getProducts } from "../services/productService";

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function mergeCart(serverItems, guestItems) {
  const merged = new Map(
    serverItems.map((item) => [String(item.id), { ...item }])
  );
  for (const guestItem of guestItems) {
    const key = String(guestItem.id);
    const current = merged.get(key);
    const quantity = Number(guestItem.quantity) || 1;
    merged.set(key, current
      ? { ...current, quantity: Number(current.quantity) + quantity }
      : guestItem);
  }
  return [...merged.values()];
}

export function StoreProvider({ children }) {
  const { token } = useAuth();
  const [products, setProducts] = useState([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState("");
  const [cart, setCart] = useState(() => readArray("cart"));
  const [wishlist, setWishlist] = useState(() => readArray("wishlist"));
  const [storeError, setStoreError] = useState("");
  const [syncedToken, setSyncedToken] = useState("");
  const previousToken = useRef(token);

  const refreshProducts = useCallback(async () => {
    try {
      setProducts(await getProducts());
      setCatalogError("");
    } catch (error) {
      setCatalogError(error.message);
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const loadProducts = async () => {
      try {
        const nextProducts = await getProducts();
        if (active) {
          setProducts(nextProducts);
          setCatalogError("");
        }
      } catch (error) {
        if (active) setCatalogError(error.message);
      } finally {
        if (active) setCatalogLoading(false);
      }
    };
    loadProducts();
    const timer = window.setInterval(loadProducts, 30000);
    window.addEventListener("focus", loadProducts);
    return () => {
      active = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", loadProducts);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("wishlist", JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    let active = true;
    const wasSignedIn = Boolean(previousToken.current);
    previousToken.current = token;
    if (!token) {
      if (wasSignedIn) {
        setCart([]);
        setWishlist([]);
      }
      return () => { active = false; };
    }
    Promise.all([getCart(), getWishlist()])
      .then(async ([serverCart, serverWishlist]) => {
        if (!active) return;
        const nextCart = wasSignedIn
          ? serverCart
          : mergeCart(serverCart, readArray("cart"));
        const nextWishlist = wasSignedIn
          ? serverWishlist
          : [...serverWishlist, ...readArray("wishlist").filter(
            (guestItem) => !serverWishlist.some(
              (item) => String(item.id) === String(guestItem.id)
            )
          )];
        if (!wasSignedIn) await saveCart(nextCart);
        if (!wasSignedIn) {
          for (const item of nextWishlist) {
            if (!serverWishlist.some(
              (serverItem) => String(serverItem.id) === String(item.id)
            )) {
              await addWishlistItem(item.id);
            }
          }
        }
        if (!active) return;
        setStoreError("");
        setCart(nextCart);
        setWishlist(nextWishlist);
      })
      .catch((error) => {
        if (active) setStoreError(error.message);
      })
      .finally(() => {
        if (active) setSyncedToken(token);
      });

    return () => { active = false; };
  }, [token]);

  const persistCart = async (nextCart) => {
    setStoreError("");
    try {
      if (token) await saveCart(nextCart);
      setCart(nextCart);
    } catch (error) {
      setStoreError(error.message);
      throw error;
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const existing = cart.find((item) => String(item.id) === String(product.id));
    const nextCart = existing
      ? cart.map((item) => String(item.id) === String(product.id)
        ? { ...item, quantity: Number(item.quantity) + quantity }
        : item)
      : [...cart, { ...product, quantity }];
    await persistCart(nextCart);
  };

  const updateCartQuantity = (id, quantity) =>
    persistCart(cart.map((item) => String(item.id) === String(id)
      ? { ...item, quantity }
      : item));

  const removeFromCart = (id) =>
    persistCart(cart.filter((item) => String(item.id) !== String(id)));

  const clearCart = () => {
    setCart([]);
    setStoreError("");
  };

  const toggleWishlist = async (product) => {
    setStoreError("");
    const exists = wishlist.some((item) => String(item.id) === String(product.id));
    try {
      if (token) {
        if (exists) await removeWishlistItem(product.id);
        else await addWishlistItem(product.id);
      }
      setWishlist((current) => exists
        ? current.filter((item) => String(item.id) !== String(product.id))
        : [...current, product]);
    } catch (error) {
      setStoreError(error.message);
      throw error;
    }
  };

  const value = {
    products,
    catalogLoading,
    catalogError,
    refreshProducts,
    cart,
    cartLoading: Boolean(token) && syncedToken !== token,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    wishlist,
    toggleWishlist,
    storeError,
    clearStoreError: () => setStoreError(""),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}
