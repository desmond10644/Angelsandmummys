import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ImagePlus,
  LogOut,
  Pencil,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  adminLogin,
  createHeroSlide,
  deleteHeroSlide,
  getAdminHeroSlides,
  reorderHeroSlides,
  resolveSlideImage,
  updateHeroSlide,
} from "../services/heroSlideService";
import "./AdminHeroSlides.css";

const emptyForm = {
  eyebrow: "",
  heading: "",
  description: "",
  primaryButtonText: "Shop Now",
  primaryButtonUrl: "/shop",
  secondaryButtonText: "Explore Categories",
  secondaryButtonUrl: "/categories",
  isActive: true,
};

function toFormData(values, image) {
  const formData = new FormData();
  Object.entries(values).forEach(([key, value]) => {
    formData.append(key, String(value));
  });
  if (image) formData.append("image", image);
  return formData;
}

function AdminHeroSlides() {
  const [token, setToken] = useState(
    () => sessionStorage.getItem("heroSlideAdminToken") || ""
  );
  const [credentials, setCredentials] = useState({ email: "", password: "" });
  const [slides, setSlides] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSlides = useCallback(async () => {
    const data = await getAdminHeroSlides(token);
    setSlides(data);
  }, [token]);

  useEffect(() => {
    if (!token) return;
    getAdminHeroSlides(token)
      .then(setSlides)
      .catch((loadError) => {
        const message = loadError.message.toLowerCase();
        if (message.includes("session") || message.includes("expired")) {
          sessionStorage.removeItem("heroSlideAdminToken");
          setToken("");
        }
        setError(loadError.message);
      });
  }, [token]);

  useEffect(
    () => () => filePreviews.forEach((preview) => URL.revokeObjectURL(preview.url)),
    [filePreviews]
  );

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token: adminToken } = await adminLogin(
        credentials.email,
        credentials.password
      );
      sessionStorage.setItem("heroSlideAdminToken", adminToken);
      setToken(adminToken);
      setCredentials({ email: "", password: "" });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    if (files.length === 0) {
      setError("Choose at least one image for the new slide.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");
    let createdCount = 0;
    try {
      for (const [index, file] of files.entries()) {
        const slideForm = {
          ...form,
          heading:
            files.length > 1
              ? `${form.heading} ${index + 1}`
              : form.heading,
        };
        await createHeroSlide(token, toFormData(slideForm, file));
        createdCount += 1;
      }
      setForm(emptyForm);
      setFiles([]);
      setFilePreviews([]);
      await loadSlides();
      setMessage(
        `${createdCount} slide${createdCount === 1 ? "" : "s"} added.`
      );
    } catch (createError) {
      setError(
        createdCount
          ? `${createError.message} ${createdCount} slide(s) were added before the error.`
          : createError.message
      );
      await loadSlides().catch((loadError) => setError(loadError.message));
    } finally {
      setLoading(false);
    }
  };

  const updateSlide = async (slide, updates) => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const { image, ...formValues } = { ...slide, ...updates };
      await updateHeroSlide(token, slide.id, toFormData(formValues, image));
      await loadSlides();
      setMessage("Slide updated.");
    } catch (updateError) {
      setError(updateError.message);
    } finally {
      setLoading(false);
      setEditingId(null);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Delete "${slide.heading}" and its image?`)) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      await deleteHeroSlide(token, slide.id);
      await loadSlides();
      setMessage("Slide deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setLoading(false);
    }
  };

  const moveSlide = async (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const reordered = [...slides];
    [reordered[index], reordered[targetIndex]] = [
      reordered[targetIndex],
      reordered[index],
    ];
    setSlides(reordered);
    setLoading(true);
    setError("");
    try {
      await reorderHeroSlides(
        token,
        reordered.map((slide) => slide.id)
      );
    } catch (reorderError) {
      setError(reorderError.message);
      await loadSlides();
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    sessionStorage.removeItem("heroSlideAdminToken");
    setToken("");
    setSlides([]);
    setError("");
  };

  if (!token) {
    return (
      <main className="am-admin-page">
        <form className="am-admin-login" onSubmit={handleLogin}>
          <span className="am-admin-eyebrow">ANGELS & MUMMIES</span>
          <h1>Slider administration</h1>
          <p>Sign in with your administrator account to manage homepage slides.</p>
          {error && <div className="am-admin-alert" role="alert">{error}</div>}
          <label htmlFor="admin-email">Admin email</label>
          <input
            id="admin-email"
            type="email"
            autoComplete="username"
            value={credentials.email}
            onChange={(event) =>
              setCredentials({ ...credentials, email: event.target.value })
            }
            required
          />
          <label htmlFor="admin-password">Password</label>
          <input
            id="admin-password"
            type="password"
            autoComplete="current-password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials({ ...credentials, password: event.target.value })
            }
            required
          />
          <button className="am-admin-primary" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className="am-admin-page">
      <div className="am-admin-shell">
        <header className="am-admin-header">
          <div>
            <span className="am-admin-eyebrow">HOMEPAGE</span>
            <h1>Hero slider</h1>
            <p>Upload images, write your slide content and arrange the order.</p>
          </div>
          <button className="am-admin-logout" type="button" onClick={logout}>
            <LogOut size={17} /> Sign out
          </button>
        </header>

        {(error || message) && (
          <div className={error ? "am-admin-alert" : "am-admin-success"} role="status">
            <span>{error || message}</span>
            <button type="button" onClick={() => { setError(""); setMessage(""); }} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </div>
        )}

        <section className="am-admin-panel">
          <div className="am-admin-panel-heading">
            <div className="am-admin-upload-icon"><ImagePlus size={20} /></div>
            <div>
              <h2>Add homepage slides</h2>
              <p>Select multiple images to create several slides at once.</p>
            </div>
          </div>
          <form className="am-admin-form" onSubmit={handleCreate}>
            <label className="am-admin-file-picker">
              <Upload size={19} />
              <span>{files.length ? `${files.length} image(s) selected` : "Choose images"}</span>
              <small>JPG, PNG or WebP · up to 8 MB each</small>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={(event) => {
                  const selectedFiles = Array.from(event.target.files || []);
                  setFiles(selectedFiles);
                  setFilePreviews(selectedFiles.map((file) => ({
                    name: file.name,
                    url: URL.createObjectURL(file),
                  })));
                }}
              />
            </label>

            {files.length > 0 && (
              <div className="am-admin-file-previews">
                {filePreviews.map((preview) => (
                  <img key={preview.url} src={preview.url} alt={preview.name} />
                ))}
              </div>
            )}

            <div className="am-admin-form-grid">
              <label>
                Small heading
                <input maxLength={120} value={form.eyebrow} onChange={(event) => setForm({ ...form, eyebrow: event.target.value })} placeholder="A little something special" />
              </label>
              <label>
                Main heading
                <input maxLength={160} value={form.heading} onChange={(event) => setForm({ ...form, heading: event.target.value })} required placeholder="A beautiful headline" />
              </label>
              <label className="am-admin-wide">
                Description
                <textarea maxLength={600} rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="A short message for your customers" />
              </label>
              <label>
                Main button text
                <input maxLength={60} value={form.primaryButtonText} onChange={(event) => setForm({ ...form, primaryButtonText: event.target.value })} />
              </label>
              <label>
                Main button link
                <input value={form.primaryButtonUrl} onChange={(event) => setForm({ ...form, primaryButtonUrl: event.target.value })} placeholder="/shop" />
              </label>
              <label>
                Second button text
                <input maxLength={60} value={form.secondaryButtonText} onChange={(event) => setForm({ ...form, secondaryButtonText: event.target.value })} />
              </label>
              <label>
                Second button link
                <input value={form.secondaryButtonUrl} onChange={(event) => setForm({ ...form, secondaryButtonUrl: event.target.value })} placeholder="/categories" />
              </label>
            </div>
            <button className="am-admin-primary" type="submit" disabled={loading}>
              {loading ? "Saving slides..." : "Add slide(s)"}
            </button>
          </form>
        </section>

        <section className="am-admin-slide-list">
          <div className="am-admin-list-heading">
            <div>
              <h2>Homepage slides</h2>
              <p>Only enabled slides appear on the homepage.</p>
            </div>
            <span>{slides.length} {slides.length === 1 ? "slide" : "slides"}</span>
          </div>

          {slides.length === 0 ? (
            <div className="am-admin-empty">No managed slides yet. Add images above to get started.</div>
          ) : (
            slides.map((slide, index) => (
              <article className={`am-admin-slide ${slide.isActive ? "" : "is-hidden"}`} key={slide.id}>
                <img className="am-admin-slide-image" src={resolveSlideImage(slide.imageUrl)} alt={slide.heading} />
                <div className="am-admin-slide-copy">
                  <div className="am-admin-slide-meta">
                    <span>SLIDE {String(index + 1).padStart(2, "0")}</span>
                    <span className={slide.isActive ? "am-admin-status is-active" : "am-admin-status"}>
                      {slide.isActive ? "On homepage" : "Hidden"}
                    </span>
                  </div>
                  <strong>{slide.heading}</strong>
                  <p>{slide.description || "No description"}</p>
                  <label className="am-admin-active-toggle">
                    <input
                      type="checkbox"
                      checked={slide.isActive}
                      disabled={loading}
                      onChange={(event) => updateSlide(slide, { isActive: event.target.checked })}
                    />
                    Show on homepage
                  </label>
                </div>
                <div className="am-admin-slide-actions">
                  <button type="button" onClick={() => moveSlide(index, -1)} disabled={loading || index === 0} aria-label="Move slide up"><ArrowUp size={18} /></button>
                  <button type="button" onClick={() => moveSlide(index, 1)} disabled={loading || index === slides.length - 1} aria-label="Move slide down"><ArrowDown size={18} /></button>
                  <button type="button" onClick={() => setEditingId(editingId === slide.id ? null : slide.id)} aria-label="Edit slide"><Pencil size={18} /></button>
                  <button type="button" className="am-admin-delete" onClick={() => handleDelete(slide)} disabled={loading} aria-label="Delete slide"><Trash2 size={18} /></button>
                </div>
                {editingId === slide.id && (
                  <form
                    className="am-admin-edit-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      const data = new FormData(event.currentTarget);
                      const values = Object.fromEntries(data.entries());
                      const image = data.get("image");
                      updateSlide(slide, {
                        ...values,
                        isActive: data.get("isActive") === "on",
                        image: image instanceof File && image.size ? image : undefined,
                      });
                    }}
                  >
                    <div className="am-admin-form-grid">
                      <label>Small heading<input name="eyebrow" defaultValue={slide.eyebrow} maxLength={120} /></label>
                      <label>Main heading<input name="heading" defaultValue={slide.heading} maxLength={160} required /></label>
                      <label className="am-admin-wide">Description<textarea name="description" defaultValue={slide.description} maxLength={600} rows={3} /></label>
                      <label>Main button text<input name="primaryButtonText" defaultValue={slide.primaryButtonText} maxLength={60} /></label>
                      <label>Main button link<input name="primaryButtonUrl" defaultValue={slide.primaryButtonUrl} /></label>
                      <label>Second button text<input name="secondaryButtonText" defaultValue={slide.secondaryButtonText} maxLength={60} /></label>
                      <label>Second button link<input name="secondaryButtonUrl" defaultValue={slide.secondaryButtonUrl} /></label>
                      <label className="am-admin-file-inline">Replace image<input name="image" type="file" accept="image/jpeg,image/png,image/webp" /></label>
                      <label className="am-admin-active-toggle"><input name="isActive" type="checkbox" defaultChecked={slide.isActive} /> Show on homepage</label>
                    </div>
                    <div className="am-admin-edit-actions">
                      <button className="am-admin-primary" type="submit" disabled={loading}>Save changes</button>
                      <button className="am-admin-cancel" type="button" onClick={() => setEditingId(null)}>Cancel</button>
                    </div>
                  </form>
                )}
              </article>
            ))
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminHeroSlides;
