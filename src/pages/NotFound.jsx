
import { Link } from "react-router-dom";
import "./NotFound.css";

function NotFound() {
  return (
    <section className="am-notfound-page">
      <div className="am-notfound-content">
        <span className="am-notfound-number">404</span>

        <h1>Oops! Page Not Found</h1>

        <p>
          The page you are looking for may have been moved,
          deleted, or does not exist.
        </p>

        <div className="am-notfound-actions">
          <Link to="/" className="am-notfound-home">
            Back to Home
          </Link>

          <Link to="/shop" className="am-notfound-shop">
            Visit Our Shop
          </Link>
        </div>
      </div>
    </section>
  );
}

export default NotFound;
