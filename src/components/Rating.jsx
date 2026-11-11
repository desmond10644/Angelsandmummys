
import { Star } from "lucide-react";
import "./Rating.css";

function Rating({ rating = 0, reviews, showNumber = true }) {
  const safeRating = Math.min(5, Math.max(0, Number(rating) || 0));

  return (
    <div className="am-rating">
      <div className="am-rating-stars" aria-label={`${safeRating} out of 5 stars`}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            className={
              star <= Math.round(safeRating)
                ? "am-star-filled"
                : "am-star-empty"
            }
          />
        ))}
      </div>

      {showNumber && (
        <span className="am-rating-number">
          {safeRating.toFixed(1)}
        </span>
      )}

      {reviews !== undefined && (
        <span className="am-rating-reviews">
          ({reviews} reviews)
        </span>
      )}
    </div>
  );
}

export default Rating;
