
import "./Loader.css";

function Loader({ text = "Loading...", fullScreen = false }) {
  return (
    <div className={`am-loader-container ${fullScreen ? "fullscreen" : ""}`}>
      <div className="am-loader"></div>
      {text && <p>{text}</p>}
    </div>
  );
}

export default Loader;
