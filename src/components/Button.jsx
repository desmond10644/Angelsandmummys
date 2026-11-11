
import "./Button.css";

function Button({
  children,
  type = "button",
  variant = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  onClick,
  className = ""
}) {
  return (
    <button
      type={type}
      className={`am-button am-button-${variant} am-button-${size} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <>
          <span className="am-button-spinner"></span>
          Please wait...
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
