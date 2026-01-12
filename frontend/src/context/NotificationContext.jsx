import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const NotificationContext = createContext(null);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasGigUpdates, setHasGigUpdates] = useState(false);
  const [hasBidUpdates, setHasBidUpdates] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUnread = localStorage.getItem("unreadCount");
    const savedGigUpdates = localStorage.getItem("hasGigUpdates");
    const savedBidUpdates = localStorage.getItem("hasBidUpdates");

    if (savedUnread) setUnreadCount(parseInt(savedUnread, 10));
    if (savedGigUpdates === "true") setHasGigUpdates(true);
    if (savedBidUpdates === "true") setHasBidUpdates(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem("unreadCount", unreadCount.toString());
  }, [unreadCount]);

  useEffect(() => {
    localStorage.setItem("hasGigUpdates", hasGigUpdates.toString());
  }, [hasGigUpdates]);

  useEffect(() => {
    localStorage.setItem("hasBidUpdates", hasBidUpdates.toString());
  }, [hasBidUpdates]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = {
      id,
      type: notification.type || "info",
      message: notification.message,
      title: notification.title,
      duration: notification.duration || 5000,
    };

    setNotifications((prev) => [...prev, newNotification]);
    setUnreadCount((prev) => prev + 1);

    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearUnreadCount = useCallback(() => {
    setUnreadCount(0);
  }, []);

  const markGigUpdatesRead = useCallback(() => {
    setHasGigUpdates(false);
  }, []);

  const markBidUpdatesRead = useCallback(() => {
    setHasBidUpdates(false);
  }, []);

  const setGigUpdate = useCallback(() => {
    setHasGigUpdates(true);
    setUnreadCount((prev) => prev + 1);
  }, []);

  const setBidUpdate = useCallback(() => {
    setHasBidUpdates(true);
    setUnreadCount((prev) => prev + 1);
  }, []);

  // Shorthand methods
  const success = useCallback(
    (message, title) => addNotification({ type: "success", message, title }),
    [addNotification]
  );

  const error = useCallback(
    (message, title) => addNotification({ type: "error", message, title }),
    [addNotification]
  );

  const warning = useCallback(
    (message, title) => addNotification({ type: "warning", message, title }),
    [addNotification]
  );

  const info = useCallback(
    (message, title) => addNotification({ type: "info", message, title }),
    [addNotification]
  );

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
    // Unread tracking
    unreadCount,
    clearUnreadCount,
    // Specific update flags
    hasGigUpdates,
    hasBidUpdates,
    markGigUpdatesRead,
    markBidUpdatesRead,
    setGigUpdate,
    setBidUpdate,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
