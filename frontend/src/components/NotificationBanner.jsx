import { useNotification } from "../context/NotificationContext";
import {
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiAlertTriangle,
  FiInfo,
} from "react-icons/fi";

const NotificationBanner = () => {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getTypeStyles = (type) => {
    switch (type) {
      case "success":
        return {
          bg: "bg-green-600",
          border: "border-green-700",
          icon: FiCheckCircle,
        };
      case "error":
        return {
          bg: "bg-red-600",
          border: "border-red-700",
          icon: FiAlertCircle,
        };
      case "warning":
        return {
          bg: "bg-yellow-500",
          border: "border-yellow-600",
          icon: FiAlertTriangle,
        };
      default:
        return {
          bg: "bg-gray-800",
          border: "border-gray-700",
          icon: FiInfo,
        };
    }
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex flex-col">
      {notifications.map((notification) => {
        const styles = getTypeStyles(notification.type);
        const Icon = styles.icon;

        return (
          <div
            key={notification.id}
            className={`${styles.bg} border-b ${styles.border} text-white px-4 py-2 flex items-center justify-between animate-slide-down`}
            style={{ animation: "slideDown 0.3s ease-out forwards" }}
          >
            <div className="flex items-center gap-3 max-w-7xl mx-auto w-full">
              <Icon className="text-lg flex-shrink-0" />
              <div className="flex-1 flex items-center gap-1">
                {notification.title && (
                  <span className="font-semibold">{notification.title}:</span>
                )}
                <span className="text-sm">{notification.message}</span>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
              >
                <FiX className="text-lg" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default NotificationBanner;
