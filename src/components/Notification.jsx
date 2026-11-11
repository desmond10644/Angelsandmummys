
import { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "lucide-react";
import "./Notification.css";

function Notification({
  message,
  type = "success",
  onClose,
  duration = 4000
}) {
  useEffect(() => {
    if (!duration || !onClose) return;

    const timer = setTimeout(onClose, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle size={21} />,
    error: <AlertCircle size={21} />,
    warning: <AlertCircle size={21} />,
    info: <Info size={21} />
  };

  return (
    <div className={`am-notification am-notification-${type}`} role="alert">
      <span className="am-notification-icon">
        {icons[type] || icons.info}
      </span>

      <p>{message}</p>

      {onClose && (
        <button onClick={onClose} aria-label="Close notification">
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export default Notification;
