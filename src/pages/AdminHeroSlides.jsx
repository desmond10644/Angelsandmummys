import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ImagePlus, LogOut, RefreshCw, Trash2, Upload } from "lucide-react";
import { useAuth } from "../context/useAuth";
import {
  createHeroSlide,
  deleteHeroSlide,
  getAdminHeroSlides,
  resolveSlideImage,
  updateHeroSlide,
} from "../services/heroSlideService";
import "./Admin.css";
import "./AdminHeroSlides.css";

const newSlideDefaults = {
  eyebrow: "",
  heading: "Discover something special",
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
    formData.append(key, String(value ?? ""));
  });
  formData.append("image", image);
  return formData;
}

function AdminHeroSlides() {
  const navigate = useNavigate();
  const { user, token, signOut } = useAuth();
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const addInputRef = useRef(null);
  const replaceInputRefs = useRef(new Map());

  const loadSlides = useCallback(async () => {
    const data = await getAdminHeroSlides();
    setSlides(data);
  }, []);

  useEffect(() => {
    if (!token) {
      navigate("/login?next=%2Fadmin%2Fhero-slides", { replace: true });
      return;
    }
    if (user?.role !== "admin") {
      navigate("/", { replace: true });
      return;
    }

    let active = true;
    getAdminHeroSlides()
      .then((data) => {
        if (active) setSlides(data);
      })
      .catch((loadError) => {
        if (!active) return;
        if (loadError.status === 401 || loadError.status === 403) {
          signOut();
          navigate("/login?next=%2Fadmin%2Fhero-slides", { replace: true });
          return;
        }
        setError(loadError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token, user, navigate, signOut]);

  const handleUpload = async (event, slide) => {
    const image = event.target.files?.[0];
    event.target.value = "";
    if (!image) return;

    setSaving(true);
    setError("");
    setNotice("");
    try {
      if (slide) {
        await updateHeroSlide(slide.id, toFormData(slide, image));
        setNotice("Hero image updated.");
      } else {
        await createHeroSlide(toFormData(newSlideDefaults, image));
        setNotice("Hero image added to the homepage.");
      }
      await loadSlides();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm("Remove this image from the homepage hero?")) return;
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await deleteHeroSlide(slide.id);
      await loadSlides();
      setNotice("Hero image deleted.");
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  if (!token || user?.role !== "admin") {
    return <main className="admin-shell"><p role="status">Opening administrator workspace...</p></main>;
  }

  return (
    <div className="admin-shell">
      <header className="admin-topbar">
        <Link className="admin-wordmark" to="/admin">A&amp;M <span>OPERATIONS</span></Link>
        <div className="admin-topbar-actions">
          <Link className="admin-secondary-button admin-hero-dashboard-link" to="/admin">Admin dashboard</Link>
          <button className="admin-logout-button" type="button" onClick={handleSignOut}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <main className="admin-content">
        <div className="admin-page-heading">
          <div>
            <p className="admin-eyebrow">ANGELS &amp; MUMMY'S / HOMEPAGE</p>
            <h1>Hero images</h1>
            <p className="admin-page-subtitle">Manage the images shown in the main page hero section.</p>
          </div>
          <button
            className="admin-primary-button admin-add-button"
            type="button"
            onClick={() => addInputRef.current?.click()}
            disabled={saving}
          >
            <ImagePlus size={17} /> Add hero image
          </button>
          <input
            ref={addInputRef}
            className="admin-hero-hidden-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => handleUpload(event, null)}
          />
        </div>

        {(error || notice) && (
          <div className={`admin-alert admin-hero-notice ${notice && !error ? "is-success" : ""}`} role={error ? "alert" : "status"}>
            <span>{error || notice}</span>
            <button type="button" onClick={() => { setError(""); setNotice(""); }} aria-label="Dismiss notification">×</button>
          </div>
        )}

        <section className="admin-table-section admin-hero-section" aria-label="Homepage hero images">
          <div className="admin-table-meta">
            <strong>{slides.length} hero {slides.length === 1 ? "image" : "images"}</strong>
            <button className="admin-icon-button" type="button" onClick={() => {
              setLoading(true);
              loadSlides().catch((loadError) => setError(loadError.message)).finally(() => setLoading(false));
            }} disabled={saving || loading} title="Refresh images" aria-label="Refresh images">
              <RefreshCw size={17} />
            </button>
          </div>

          {loading ? (
            <div className="admin-loading"><span className="admin-spinner" /> Loading hero images</div>
          ) : slides.length === 0 ? (
            <div className="admin-hero-empty">
              <ImagePlus size={24} />
              <p>No hero images yet. Add an image to display it on the homepage.</p>
            </div>
          ) : (
            <div className="admin-hero-grid">
              {slides.map((slide, index) => (
                <article className="admin-hero-card" key={slide.id}>
                  <img
                    className="admin-hero-image"
                    src={resolveSlideImage(slide.imageUrl)}
                    alt={`Homepage hero image ${index + 1}`}
                  />
                  <div className="admin-hero-card-footer">
                    <span>Hero image {index + 1}<small className={slide.isActive ? "is-live" : ""}>{slide.isActive ? "On homepage" : "Hidden"}</small></span>
                    <div className="admin-hero-actions">
                      <input
                        ref={(element) => {
                          if (element) replaceInputRefs.current.set(slide.id, element);
                          else replaceInputRefs.current.delete(slide.id);
                        }}
                        className="admin-hero-hidden-input"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => handleUpload(event, slide)}
                      />
                      <button
                        className="admin-secondary-button admin-hero-action"
                        type="button"
                        disabled={saving}
                        onClick={() => replaceInputRefs.current.get(slide.id)?.click()}
                      >
                        <Upload size={15} /> Edit image
                      </button>
                      <button
                        className="admin-hero-delete"
                        type="button"
                        disabled={saving}
                        onClick={() => handleDelete(slide)}
                        aria-label={`Delete hero image ${index + 1}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
        <p className="admin-hero-help">Images must be JPG, PNG, or WebP and no larger than 8 MB.</p>
      </main>
    </div>
  );
}

export default AdminHeroSlides;
