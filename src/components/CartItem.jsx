
import { Trash2, Minus, Plus } from "lucide-react";
import "./CartItem.css";

function CartItem({ item, onQuantityChange, onRemove }) {
  if (!item) return null;

  const {
    id,
    name,
    price,
    image,
    image_url,
    quantity = 1
  } = item;

  const formatPrice = (amount) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN"
    }).format(Number(amount) || 0);

  const updateQuantity = (newQuantity) => {
    if (newQuantity < 1) return;
    onQuantityChange?.(id, newQuantity);
  };

  return (
    <div className="am-cart-item">
      <div className="am-cart-item-image">
        <img
          src={image || image_url || "/placeholder.png"}
          alt={name}
        />
      </div>

      <div className="am-cart-item-details">
        <h3>{name}</h3>
        <p className="am-cart-item-price">{formatPrice(price)}</p>

        <div className="am-cart-quantity">
          <button
            onClick={() => updateQuantity(Number(quantity) - 1)}
            disabled={Number(quantity) <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={15} />
          </button>

          <span>{quantity}</span>

          <button
            onClick={() => updateQuantity(Number(quantity) + 1)}
            aria-label="Increase quantity"
          >
            <Plus size={15} />
          </button>
        </div>
      </div>

      <div className="am-cart-item-actions">
        <strong>
          {formatPrice(Number(price) * Number(quantity))}
        </strong>

        <button
          className="am-remove-item"
          onClick={() => onRemove?.(id)}
          aria-label="Remove item"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default CartItem;
