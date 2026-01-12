import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import toast from "react-hot-toast";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?._id) {
      // Connect to socket server
      const newSocket = io("http://localhost:5000", {
        withCredentials: true,
      });

      newSocket.on("connect", () => {
        console.log("🔌 Socket connected:", newSocket.id);
        // Join with user ID to receive personal notifications
        newSocket.emit("join", user._id);
      });

      // Listen for hire notifications (when freelancer is hired)
      newSocket.on("hired", (data) => {
        console.log("🎉 Hired notification received:", data);

        // Show toast notification
        toast.success(data.message, {
          duration: 6000,
          icon: "🎉",
          style: {
            background: "#10b981",
            color: "#fff",
            fontWeight: "500",
          },
        });

        // Add to notifications list
        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "hired",
            message: data.message,
            title: data.title,
            gig: data.gig,
            bid: data.bid,
            timestamp: data.timestamp,
            read: false,
          },
          ...prev,
        ]);
      });

      // Listen for new bid notifications (for gig owners)
      newSocket.on("newBid", (data) => {
        console.log("📩 New bid notification received:", data);

        toast.success(data.message, {
          duration: 4000,
          icon: "📩",
        });

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "new_bid",
            message: data.message,
            title: data.title,
            bid: data.bid,
            timestamp: data.timestamp,
            read: false,
          },
          ...prev,
        ]);
      });

      // Listen for bid rejected notifications
      newSocket.on("bidRejected", (data) => {
        console.log("😔 Bid rejected notification received:", data);

        toast(data.message, {
          duration: 4000,
          icon: "😔",
        });

        setNotifications((prev) => [
          {
            id: Date.now(),
            type: "bid_rejected",
            message: data.message,
            title: data.title,
            gigTitle: data.gigTitle,
            timestamp: data.timestamp,
            read: false,
          },
          ...prev,
        ]);
      });

      newSocket.on("disconnect", () => {
        console.log("❌ Socket disconnected");
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    } else {
      // Close socket if user logs out
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user?._id]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SocketContext.Provider
      value={{
        socket,
        notifications,
        unreadCount,
        clearNotifications,
        markAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
