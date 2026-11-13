import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Boxes,
  ClipboardList,
  ImagePlus,
  LogOut,
  Plus,
  RefreshCw,
  ShieldCheck,
  Tag,
  UsersRound,
  X,
} from "lucide-react";
import { adminRequest } from "../services/adminApi";
import { useAuth } from "../context/useAuth";
import { resolveProductImage } from "../services/productService";
import "./Admin.css";

const emptyProduct = {
  name: "",
  category: "",
  price: "",
  delivery_price: "0",
  rating: "0",
  reviews: "0",
  badge: "",
  description: "",
  image: "",
  stock: "0",
};
const emptyAdmin = { fullName: "", email: "", phone: "", password: "" };

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
const currency = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

async function fetchWorkspaceData() {
  const [productData, customerData, orderData, adminData, categoryData] = await Promise.all([
    adminRequest("/api/products"),
    adminRequest("/api/account/customers"),
    adminRequest("/api/orders"),
    adminRequest("/api/account/admins"),
    adminRequest("/api/products/categories"),
  ]);
  return {
    products: productData.products || [],
    customers: customerData.customers || [],
    orders: orderData.orders || [],
    admins: adminData.admins || [],
    categories: categoryData.categories || [],
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
  const { user, token, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("products");
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [productDialog, setProductDialog] = useState(null);
  const [productForm, setProductForm] = useState(emptyProduct);
  const [savingProduct, setSavingProduct] = useState(false);
  const [productImageFile, setProductImageFile] = useState(null);
  const [productImagePreview, setProductImagePreview] = useState("");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoryDialog, setCategoryDialog] = useState(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [adminDialog, setAdminDialog] = useState(false);
  const [adminForm, setAdminForm] = useState(emptyAdmin);
  const [savingAdmin, setSavingAdmin] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchWorkspaceData();
      setProducts(data.products);
      setCustomers(data.customers);
      setOrders(data.orders);
      setAdmins(data.admins);
      setCategories(data.categories);
    } catch (requestError) {
      if (requestError.status === 401 || requestError.status === 403) {
        signOut();
        navigate("/login?next=%2Fadmin", { replace: true });
        return;
      }
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login?next=%2Fadmin", { replace: true });
      return;
    }
    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    fetchWorkspaceData()
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setCustomers(data.customers);
        setOrders(data.orders);
        setAdmins(data.admins);
        setCategories(data.categories);
      })
      .catch((requestError) => {
        if (cancelled) return;
        if (requestError.status === 401 || requestError.status === 403) {
          signOut();
          navigate("/login?next=%2Fadmin", { replace: true });
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
  }, [navigate, token, user, signOut]);

  useEffect(() => () => {
    if (productImagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(productImagePreview);
    }
  }, [productImagePreview]);

  const openNewProduct = () => {
    setProductDialog({ mode: "create" });
    setProductForm(emptyProduct);
    setProductImageFile(null);
    setProductImagePreview("");
    setError("");
  };

  const openEditProduct = (product) => {
    setProductDialog({ mode: "edit", id: product.id });
    setProductForm({
      name: product.name || "",
      category: product.category || "",
      price: String(product.price ?? ""),
      delivery_price: String(product.delivery_price ?? "0"),
      rating: String(product.rating ?? "0"),
      reviews: String(product.reviews ?? "0"),
      badge: product.badge || "",
      description: product.description || "",
      image: product.image || "",
      stock: String(product.stock ?? "0"),
    });
    setProductImageFile(null);
    setProductImagePreview(resolveProductImage(product.image || ""));
    setError("");
  };

  const closeProductDialog = () => {
    setProductDialog(null);
    setProductImageFile(null);
    setProductImagePreview("");
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
      delivery_price: Number(productForm.delivery_price),
      rating: Number(productForm.rating),
      reviews: Number(productForm.reviews),
      badge: productForm.badge.trim() || null,
      description: productForm.description.trim(),
      image: productForm.image.trim(),
      stock: Number(productForm.stock),
    };

    try {
      const isEdit = productDialog.mode === "edit";
      const formData = new FormData();
      Object.entries(payload).forEach(([field, value]) => {
        if (field === "image" && productImageFile) return;
        formData.append(field, value == null ? "" : String(value));
      });
      if (productImageFile) formData.append("image", productImageFile);
      await adminRequest(
        isEdit ? `/api/products/${productDialog.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          body: formData,
        }
      );
      setProductDialog(null);
      setProductImageFile(null);
      setProductImagePreview("");
      setNotice(isEdit ? "Product updated." : "Product added.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProduct(false);
    }
  };

  const renameCategory = async (event) => {
    event.preventDefault();
    setSavingCategory(true);
    setError("");
    try {
      const { category, name, image } = categoryDialog;
      const formData = new FormData();
      formData.append("name", name.trim());
      if (image) formData.append("image", image);
      const result = category
        ? await adminRequest(`/api/products/categories/${encodeURIComponent(category)}`, {
          method: "PATCH",
          body: formData,
        })
        : await adminRequest("/api/products/categories", {
          method: "POST",
          body: formData,
        });
      setCategoryDialog(null);
      setNotice(category
        ? name.trim() === category
          ? "Category image updated."
          : `Category updated across ${result.updatedProducts} products.`
        : "Category added.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingCategory(false);
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

  const createAdmin = async (event) => {
    event.preventDefault();
    setSavingAdmin(true);
    setError("");
    try {
      await adminRequest("/api/account/admins", {
        method: "POST",
        body: JSON.stringify(adminForm),
      });
      setAdminForm(emptyAdmin);
      setAdminDialog(false);
      setNotice("Administrator account created.");
      await loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingAdmin(false);
    }
  };

  const logout = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  const tabs = [
    { id: "products", label: "Products", icon: Boxes, count: products.length },
    { id: "orders", label: "Orders", icon: ClipboardList, count: orders.length },
    { id: "customers", label: "Customers", icon: UsersRound, count: customers.length },
    { id: "admins", label: "Admins", icon: ShieldCheck, count: admins.length },
    { id: "categories", label: "Categories", icon: Tag, count: categories.length },
  ];

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-wordmark" to="/admin">A&M <span>OPERATIONS</span></Link>
        <div className="admin-topbar-actions">
        <Link className="admin-secondary-button" to="/admin/hero-slides">Hero slides</Link>
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
              <h1>{activeTab === "products" ? "Product catalog" : activeTab === "orders" ? "Order fulfilment" : activeTab === "admins" ? "Administrator access" : activeTab === "categories" ? "Product categories" : "Customers"}</h1>
              <p className="admin-page-subtitle">
                {activeTab === "products" && "Manage product details, pricing, images, and available stock."}
                {activeTab === "orders" && "Review customer orders and keep fulfilment status current."}
                {activeTab === "customers" && "User accounts and their order activity."}
                {activeTab === "admins" && "Manage administrator access for the store."}
                {activeTab === "categories" && "Edit category names and the images used on category pages."}
              </p>
            </div>
            {activeTab === "products" && (
              <button className="admin-primary-button admin-add-button" type="button" onClick={openNewProduct}>
                <Plus size={17} /> Add product
              </button>
            )}
            {activeTab === "admins" && (
              <button className="admin-primary-button admin-add-button" type="button" onClick={() => {
                setAdminForm(emptyAdmin);
                setAdminDialog(true);
              }}>
                <Plus size={17} /> Add administrator
              </button>
            )}
            {activeTab === "categories" && (
              <button className="admin-primary-button admin-add-button" type="button" onClick={() => setCategoryDialog({ category: null, name: "", image_url: "", image: null })}>
                <Plus size={17} /> Add category
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
                      <thead><tr><th>Product</th><th>Category</th><th>Price</th><th>Delivery / unit</th><th>Stock</th><th>Rating</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id}>
                            <td><div className="admin-product-cell"><img src={resolveProductImage(product.image) || "/placeholder.png"} alt="" /><div><strong>{product.name}</strong><small>#{product.id}{product.badge ? ` · ${product.badge}` : ""}</small></div></div></td>
                            <td>{product.category}</td>
                            <td>{currency.format(Number(product.price))}</td>
                            <td>{currency.format(Number(product.delivery_price || 0))}</td>
                            <td><span className={`admin-stock ${Number(product.stock) < 5 ? "is-low" : ""}`}>{product.stock} units</span></td>
                            <td>{Number(product.rating || 0).toFixed(1)} <span className="admin-muted">({product.reviews || 0})</span></td>
                            <td><div className="admin-row-actions"><button type="button" onClick={() => openEditProduct(product)}>Edit</button><button className="is-danger" type="button" onClick={() => deleteProduct(product)}>Delete</button></div></td>
                          </tr>
                        ))}
                        {products.length === 0 && <tr><td className="admin-empty-cell" colSpan="7">No active products in the catalog.</td></tr>}
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

              {activeTab === "admins" && (
                <section className="admin-table-section" aria-label="Administrator accounts">
                  <div className="admin-table-meta"><strong>{admins.length} administrators</strong><span>Admin access</span></div>
                  <div className="admin-table-scroll">
                    <table className="admin-table admin-customers-table">
                      <thead><tr><th>Administrator</th><th>Phone</th><th>Joined</th></tr></thead>
                      <tbody>
                        {admins.map((admin) => (
                          <tr key={admin.id}>
                            <td><div className="admin-customer-cell"><strong>{admin.full_name}</strong><small>{admin.email}</small></div></td>
                            <td>{admin.phone || "-"}</td>
                            <td>{formatDate(admin.created_at)}</td>
                          </tr>
                        ))}
                        {admins.length === 0 && <tr><td className="admin-empty-cell" colSpan="3">No administrators found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {activeTab === "categories" && (
                <section className="admin-table-section" aria-label="Product categories">
                  <div className="admin-table-meta"><strong>{categories.length} categories</strong><span>Category changes apply to all assigned products</span></div>
                  <div className="admin-table-scroll">
                    <table className="admin-table admin-customers-table">
                      <thead><tr><th>Image</th><th>Category</th><th>Products</th><th><span className="admin-sr-only">Actions</span></th></tr></thead>
                      <tbody>
                        {categories.map((category) => (
                          <tr key={category.category}>
                            <td>
                              {category.image_url ? (
                                <img className="admin-category-image" src={resolveProductImage(category.image_url)} alt="" />
                              ) : (
                                <span className="admin-category-no-image">No image</span>
                              )}
                            </td>
                            <td><strong>{category.category}</strong></td>
                            <td>{category.product_count}</td>
                            <td>
                              <div className="admin-row-actions">
                                <button
                                  type="button"
                                  onClick={() => setCategoryDialog({
                                    category: category.category,
                                    name: category.category,
                                    image_url: category.image_url || "",
                                    image: null,
                                  })}
                                >
                                  Edit
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {categories.length === 0 && <tr><td className="admin-empty-cell" colSpan="4">No product categories yet. Add a product to create one.</td></tr>}
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
          if (event.target === event.currentTarget && !savingProduct) closeProductDialog();
        }}>
          <section className="admin-product-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-product-dialog-title">
            <div className="admin-dialog-heading">
              <div><p className="admin-eyebrow">PRODUCT CATALOG</p><h2 id="admin-product-dialog-title">{productDialog.mode === "edit" ? "Edit product" : "Add product"}</h2></div>
              <button className="admin-icon-button" type="button" aria-label="Close dialog" onClick={closeProductDialog} disabled={savingProduct}><X size={19} /></button>
            </div>
            {error && <div className="admin-alert" role="alert">{error}</div>}
            <form className="admin-product-form" onSubmit={saveProduct}>
              <label className="admin-field-wide">Product name<input value={productForm.name} onChange={(event) => setProductForm({ ...productForm, name: event.target.value })} required /></label>
              <label>Category<input list="admin-product-categories" value={productForm.category} onChange={(event) => setProductForm({ ...productForm, category: event.target.value })} maxLength="80" required /><datalist id="admin-product-categories">{categories.map((category) => <option value={category.category} key={category.category} />)}</datalist></label>
              <label>Price (NGN)<input type="number" min="0" step="1" value={productForm.price} onChange={(event) => setProductForm({ ...productForm, price: event.target.value })} required /></label>
              <label>Delivery price per unit (NGN)<input type="number" min="0" step="1" value={productForm.delivery_price} onChange={(event) => setProductForm({ ...productForm, delivery_price: event.target.value })} required /></label>
              <label>Available stock<input type="number" min="0" step="1" value={productForm.stock} onChange={(event) => setProductForm({ ...productForm, stock: event.target.value })} required /></label>
              <label>Rating<input type="number" min="0" max="5" step="0.1" value={productForm.rating} onChange={(event) => setProductForm({ ...productForm, rating: event.target.value })} /></label>
              <label>Review count<input type="number" min="0" step="1" value={productForm.reviews} onChange={(event) => setProductForm({ ...productForm, reviews: event.target.value })} /></label>
              <label>Badge<input value={productForm.badge} onChange={(event) => setProductForm({ ...productForm, badge: event.target.value })} placeholder="Optional" /></label>
              <label className="admin-field-wide admin-image-upload">
                Product image{productDialog.mode === "create" ? " (required)" : ""}
                <input
                  key={`${productDialog.mode}-${productDialog.id || "new"}`}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  required={productDialog.mode === "create"}
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    setProductImageFile(file);
                    setProductImagePreview(file ? URL.createObjectURL(file) : productForm.image);
                  }}
                />
                <small>JPG, PNG or WebP · up to 8 MB</small>
                {productImagePreview && <img className="admin-image-preview" src={productImagePreview.startsWith("/uploads/") ? resolveProductImage(productImagePreview) : productImagePreview} alt="Product preview" />}
              </label>
              <label className="admin-field-wide">Description<textarea rows="3" value={productForm.description} onChange={(event) => setProductForm({ ...productForm, description: event.target.value })} required /></label>
              <div className="admin-dialog-actions"><button className="admin-secondary-button" type="button" onClick={closeProductDialog} disabled={savingProduct}>Cancel</button><button className="admin-primary-button" type="submit" disabled={savingProduct}>{savingProduct ? "Saving..." : productDialog.mode === "edit" ? "Save changes" : "Add product"}</button></div>
            </form>
          </section>
        </div>
      )}

      {adminDialog && (
        <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingAdmin) setAdminDialog(false);
        }}>
          <section className="admin-product-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-create-title">
            <div className="admin-dialog-heading">
              <div><p className="admin-eyebrow">ADMIN ACCESS</p><h2 id="admin-create-title">Add administrator</h2></div>
              <button className="admin-icon-button" type="button" aria-label="Close dialog" onClick={() => setAdminDialog(false)} disabled={savingAdmin}><X size={19} /></button>
            </div>
            {error && <div className="admin-alert" role="alert">{error}</div>}
            <form className="admin-product-form" onSubmit={createAdmin}>
              <label className="admin-field-wide">Full name<input value={adminForm.fullName} onChange={(event) => setAdminForm({ ...adminForm, fullName: event.target.value })} minLength="2" maxLength="120" required /></label>
              <label className="admin-field-wide">Email address<input type="email" value={adminForm.email} onChange={(event) => setAdminForm({ ...adminForm, email: event.target.value })} required /></label>
              <label className="admin-field-wide">Phone number<input type="tel" value={adminForm.phone} onChange={(event) => setAdminForm({ ...adminForm, phone: event.target.value })} minLength="6" maxLength="30" required /></label>
              <label className="admin-field-wide">Temporary password<input type="password" value={adminForm.password} onChange={(event) => setAdminForm({ ...adminForm, password: event.target.value })} minLength="8" maxLength="72" autoComplete="new-password" required /></label>
              <div className="admin-dialog-actions"><button className="admin-secondary-button" type="button" onClick={() => setAdminDialog(false)} disabled={savingAdmin}>Cancel</button><button className="admin-primary-button" type="submit" disabled={savingAdmin}>{savingAdmin ? "Creating..." : "Create administrator"}</button></div>
            </form>
          </section>
        </div>
      )}

      {categoryDialog && (
        <div className="admin-dialog-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !savingCategory) setCategoryDialog(null);
        }}>
          <section className="admin-product-dialog" role="dialog" aria-modal="true" aria-labelledby="admin-category-dialog-title">
            <div className="admin-dialog-heading">
              <div><p className="admin-eyebrow">PRODUCT CATEGORIES</p><h2 id="admin-category-dialog-title">{categoryDialog.category ? "Edit category" : "Add category"}</h2></div>
              <button className="admin-icon-button" type="button" aria-label="Close dialog" onClick={() => setCategoryDialog(null)} disabled={savingCategory}><X size={19} /></button>
            </div>
            {error && <div className="admin-alert" role="alert">{error}</div>}
            <form className="admin-product-form" onSubmit={renameCategory}>
              <label className="admin-field-wide">Category name<input value={categoryDialog.name} onChange={(event) => setCategoryDialog({ ...categoryDialog, name: event.target.value })} minLength="1" maxLength="80" required autoFocus /></label>
              {categoryDialog.image_url && !categoryDialog.image && (
                <div className="admin-category-image-preview"><img src={resolveProductImage(categoryDialog.image_url)} alt="" /><span>Current category image</span></div>
              )}
              <label className="admin-field-wide">Category image (JPG, PNG, or WebP, max 8 MB)
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setCategoryDialog({ ...categoryDialog, image: event.target.files?.[0] || null })} />
              </label>
              {categoryDialog.image && <p className="admin-category-file-name"><ImagePlus size={15} /> {categoryDialog.image.name}</p>}
              <div className="admin-dialog-actions"><button className="admin-secondary-button" type="button" onClick={() => setCategoryDialog(null)} disabled={savingCategory}>Cancel</button><button className="admin-primary-button" type="submit" disabled={savingCategory || (categoryDialog.category === categoryDialog.name.trim() && !categoryDialog.image)}>{savingCategory ? "Saving..." : categoryDialog.category ? "Save category" : "Add category"}</button></div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;