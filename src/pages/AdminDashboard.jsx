import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  LogOut,
  Plus,
  RefreshCw,
  UsersRound,
  X,
} from "lucide-react";
import { adminRequest } from "../services/adminApi";
import "./Admin.css";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  rating: "0",
  reviews: "0",
  badge: "",
  description: "",
  image: "",
  stock: "0",
};

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

async function fetchWorkspaceData() {
  const [productData, customerData, orderData] = await Promise.all([
    adminRequest("/api/products"),
    adminRequest("/api/account/customers"),
    adminRequest("/api/orders"),
  ]);
  return {
    products: productData.products || [],
    customers: customerData.customers || [],
    orders: orderData.orders || [],
  };
}

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productDialog, setProductDialog] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWorkspaceData();
      setProducts(data.products);
      setCustomers(data.customers);
      setOrders(data.orders);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/admin/login", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!localStorage.getItem("token") || user?.role !== "admin") {
      navigate("/admin/login", { replace: true });
      return;
    }

    let cancelled = false;
    fetchWorkspaceData()
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setCustomers(data.customers);
        setOrders(data.orders);
      })
      .catch((requestError) => {
        if (cancelled) return;
        if (requestError.status === 401 || requestError.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/admin/login", { replace: true });
          return;
        }
        setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [navigate]);

  const openNewProduct = () => {
    setProductDialog({ mode: "create" });
    setProductForm(emptyProduct);
    setError("");
  };

  const openEditProduct = (product) => {
    setProductDialog({ mode: "edit", id: product.id });
    setProductForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      rating: String(product.rating ?? "0"),
      reviews: String(product.reviews ?? "0"),
      badge: product.badge || "",
      description: product.description || "",
      image: product.image || "",
      stock: String(product.stock ?? "0"),
    });
    setError("");
  };

  const saveProduct = async (event) => {
    event.preventDefault();
    setSavingProduct(true);
    setError("");
    const payload = {
      ...productForm,
      name: productForm.name.trim(),
      category: productForm.category.trim(),
      price: Number(productForm.price),
      rating: Number(productForm.rating),
      reviews: Number(productForm.reviews),
      badge: productForm.badge.trim() || null,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      stock: Number(productForm.stock),
    };

    try {
      const isEdit = productDialog.mode === "edit";
      await adminRequest(
        isEdit ? `/api/products/${productDialog.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      );
      setProductDialog(null);
      setNotice(isEdit ? "Product updated." : "Product added.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const deleteProduct = async (product) => {
    if (!window.confirm(`Remove “${product.name}” from the active catalog?`)) return;
    setError("");
    try {
      await adminRequest(`/api/products/${product.id}`, { method: "DELETE" });
      setNotice("Product removed from the catalog.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    setUpdatingOrder(orderId);
    setError("");
    try {
      await adminRequest(`/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      setOrders((current) => current.map((order) =>
        order.id === orderId ? { ...order, status } : order
      ));
      setNotice(`Order ${orderId} updated.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingOrder(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/admin/login", { replace: true });
  };

  const tabs = [
    { id: "products", label: "Products", icon: Boxes, count: products.length },
    { id: "orders", label: "Orders", icon: ClipboardList, count: orders.length },
    { id: "customers", label: "Customers", icon: UsersRound, count: customers.length },
  ];

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-wordmark" href="/admin">A&M <span>OPERATIONS</span></a>
        <div className="admin-topbar-actions">
          <button className="admin-icon-button" type="button" onClick={loadData} title="Refresh data" aria-label="Refresh data">
            <RefreshCw size={17} />
          </button>
          <button className="admin-logout-button" type="button" onClick={logout}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <p className="admin-eyebrow">WORKSPACE</p>
          <nav aria-label="Admin sections">
            {tabs.map(({ id, label, icon: Icon, count }) => (
              <button
                className={`admin-nav-item ${activeTab === id ? "is-active" : ""}`}
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
              >
                <Icon size={18} />
                <span>{label}</span>
                <small>{count}</small>
              </button>
            ))}
          </nav>
          <div className="admin-sidebar-foot">
            <span className="admin-status-dot" /> Store API connected
          </div>
        </aside>

        <section className="admin-content">
          <div className="admin-page-heading">
            <div>
              <p className="admin-eyebrow">ANGELS & MUMMY'S / {activeTab.toUpperCase()}</p>
              <h1>{activeTab === "products" ? "Product catalog" : activeTab === "orders" ? "Order fulfilment" : "Customers"}</h1>
              <p className="admin-page-subtitle">
                {activeTab === "products" && "Manage product details, pricing, images, and available stock."}
                {activeTab === "orders" && "Review customer orders and keep fulfilment status current."}
                {activeTab === "customers" && "Customer accounts and their order activity."}
              </p>
            </div>
            {activeTab === "products" && (
              <button className="admin-primary-button admin-add-button" type="button" onClick={openNewProduct}>
                <Plus size={17} /> Add product
              </button>
            )}
          </div>

          {error && <div className="admin-alert admin-page-alert" role="alert">{error}</div>}
          {notice && (
            <div className="admin-notice" role="status">
              <span>{notice}</span>
              <button type="button" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={15} /></button>
            </div>
          )}

          {loading ? (
            <div className="admin-loading"><span className="admin-spinner" /> Loading workspace data</div>
          ) : (
            <>
              {activeTab === "products" && (
                <section className="admin-table-section" aria-label="Product catalog">
                  <div className="admin-table-meta"><strong>{products.length} active products</strong><span>Prices in NGN</span></div>
                  <div className="admin-table-scroll">
                    <table className="admin-table admin-products-table">
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Rating</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td><div className="admin-product-cell"><img src={product.image || "/placeholder.png"} alt="" /><div><strong>{product.name}</strong><small>#{product.id}{product.badge ? ` · ${product.badge}` : ""}</small></div></div></td>
                            <td>{product.category}</td>
                            <td>{currency.format(Number(product.price))}</td>
                            <td><span className={`admin-stock ${Number(product.stock) < 5 ? "is-low" : ""}`}>{product.stock} units</span></td>
                            <td>{Number(product.rating || 0).toFixed(1)} <span className="admin-muted">({product.reviews || 0})</span></td>
                            <td><div className="admin-row-actions"><button type="button" onClick={() => openEditProduct(product)}>Edit</button><button className="is-danger" type="button" onClick={() => deleteProduct(product)}>Delete</button></div></td>
                          </tr>
                        ))}
                        {products.length === 0 && <tr><td className="admin-empty-cell" colSpan="6">No active products in the catalog.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "orders" && (
                <section className="admin-table-section" aria-label="Customer orders">
                  <div className="admin-table-meta"><strong>{orders.length} orders</strong><span>Newest first</span></div>
                  <div className="admin-table-scroll">
                    <table className="admin-table admin-orders-table">
                      <thead><tr><th>Order</th><th>Customer</th><th>Items</th><th>Total</th><th>Placed</th><th>Fulfilment</th></tr></thead>
                      <tbody>
                        {orders.map((order) => (
                          <tr key={order.id}>
                            <td><strong className="admin-order-id">{order.id}</strong></td>
                            <td><div className="admin-customer-cell"><strong>{order.full_name}</strong><small>{order.email} · {order.phone}</small><small>{order.address}, {order.city}, {order.state}</small></div></td>
                            <td><div className="admin-order-items">{(order.items || []).map((item) => <span key={`${order.id}-${item.productId}`}>{item.name} × {item.quantity}</span>)}</div></td>
                            <td><strong>{currency.format(Number(order.total))}</strong><small className="admin-block-note">{order.payment_status || "unpaid"}</small></td>
                            <td>{formatDate(order.created_at)}</td>
                            <td><select className={`admin-status-select status-${order.status}`} aria-label={`Fulfilment status for order ${order.id}`} value={order.status} disabled={updatingOrder === order.id} onChange={(event) => updateOrderStatus(order.id, event.target.value)}>{orderStatuses.map((status) => <option value={status} key={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></td>
                          </tr>
                        ))}
                        {orders.length === 0 && <tr><td className="admin-empty-cell" colSpan="6">No orders have been placed yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "customers" && (
                <section className="admin-table-section" aria-label="Customer directory">
                  <div className="admin-table-meta"><strong>{customers.length} customers</strong><span>Customer accounts only</span></div>
                  <div className="admin-table-scroll">
                    <table className="admin-table admin-customers-table">
                      <thead><tr><th>Customer</th><th>Phone</th><th>Joined</th><th>Orders</th><th>Last order</th></tr></thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id}>
                            <td><div className="admin-customer-cell"><strong>{customer.full_name}</strong><small>{customer.email}</small></div></td>
                            <td>{customer.phone || "-"}</td>
                            <td>{formatDate(customer.created_at)}</td>
                            <td>{customer.order_count}</td>
                            <td>{formatDate(customer.last_order_at)}</td>
                          </tr>
                        ))}
                        {customers.length === 0 && <tr><td className="admin-empty-cell" colSpan="5">No customer accounts yet.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          )}
        </section>
      </div>

      {productDialog && (
        <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingProduct) setProductDialog(null);
        }}>
          <section className="admin-product-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-product-dialog-title">
            <div className="admin-dialog-heading">
              <div><p className="admin-eyebrow">PRODUCT CATALOG</p><h2 id="admin-product-dialog-title">{productDialog.mode === "edit" ? "Edit product" : "Add product"}</h2></div>
              <button className="admin-icon-button" type="button" aria-label="Close dialog" onClick={() => setProductDialog(null)} disabled={savingProduct}><X size={19} /></button>
            </div>
            {error && <div className="admin-alert" role="alert">{error}</div>}
            <form className="admin-product-form" onSubmit={saveProduct}>
              <label className="admin-field-wide">Product name<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
              <label>Category<input value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} required /></label>
              <label>Price (NGN)<input type="number" min="0" step="1" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
              <label>Available stock<input type="number" min="0" step="1" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required /></label>
              <label>Rating<input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={(event) => setProductForm({ ...productForm, rating: event.target.value })} /></label>
              <label>Review count<input type="number" min="0" step="1" value={productForm.reviews} onChange={(event) => setProductForm({ ...productForm, reviews: event.target.value })} /></label>
              <label>Badge<input value={productForm.badge} onChange={(event) => setProductForm({ ...productForm, badge: event.target.value })} placeholder="Optional" /></label>
              <label className="admin-field-wide">Image URL<input type="url" value={productForm.image} onChange={(event) => setProductForm({ ...productForm, image: event.target.value })} required /></label>
              <label className="admin-field-wide">Description<textarea rows="3" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required /></label>
              <div className="admin-dialog-actions"><button className="admin-secondary-button" type="button" onClick={() => setProductDialog(null)} disabled={savingProduct}>Cancel</button><button className="admin-primary-button" type="submit" disabled={savingProduct}>{savingProduct ? "Saving..." : productDialog.mode === "edit" ? "Save changes" : "Add product"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;