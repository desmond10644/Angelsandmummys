
import { Package, Eye } from "lucide-react";
import Button from "./Button";
import "./OrderCard.css";

function OrderCard({ order, onViewDetails }) {
  if (!order) return null;

  const orderId = order.id || order.order_number;
  const total = order.total_amount ?? order.total ?? 0;
  const date = order.created_at || order.order_date;
  const status = order.status || "Pending";

  const formattedDate = date
    ? new Date(date).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "Date unavailable";

  const formattedTotal = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN"
  }).format(Number(total));

  const statusClass = String(status)
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <div className="am-order-card">
      <div className="am-order-icon">
        <Package size={25} />
      </div>

      <div className="am-order-details">
        <h3>Order #{orderId}</h3>
        <p>Placed on {formattedDate}</p>
        <strong>{formattedTotal}</strong>
      </div>

      <div className="am-order-actions">
        <span className={`am-order-status ${statusClass}`}>
          {status}
        </span>

        <Button
          variant="outline"
          size="small"
          onClick={() => onViewDetails?.(order)}
        >
          <Eye size={15} />
          View
        </Button>
      </div>
    </div>
  );
}

export default OrderCard;
