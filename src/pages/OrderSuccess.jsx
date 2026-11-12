
import { Link } from "react-router-dom";
import "./OrderSuccess.css";

function OrderSuccess() {
  const order = JSON.parse(
    sessionStorage.getItem("latestOrder") || "null"
  );

  return (
    <section className="am-success-page">
      <div className="am-success-card">
        <div className="am-success-icon">✓</div>

        <h1>Thank You for Your Order!</h1>
        <p>Your order has been received successfully.</p>

        {order && (
          <div className="am-success-details">
            <p>
              Order Number: <strong>{order.id}</strong>
            </p>
            <p>
              Order Total:{" "}
              <strong>
                ₦{Number(order.total).toLocaleString("en-NG")}
              </strong>
            </p>
            <p>Payment status: <strong>{order.payment_status || "unpaid"}</strong></p>
            <p>
              Order Status: <strong>{order.status}</strong>
            </p>
          </div>
        )}

        <div className="am-success-actions">
          <Link to="/orders">View My Orders</Link>
          <Link to="/shop">Continue Shopping</Link>
        </div>
      </div>
    </section>
  );
}

export default OrderSuccess;
