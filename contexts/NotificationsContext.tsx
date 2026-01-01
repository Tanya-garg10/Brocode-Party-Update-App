import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useMemo,
  useEffect,
} from "react";
import { Notification } from "../types";

/* -------------------------------------------------------------------------- */
/* Types */
/* -------------------------------------------------------------------------- */

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  notify: (title: string, message: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

/* -------------------------------------------------------------------------- */
/* Context */
/* -------------------------------------------------------------------------- */

const NotificationsContext =
  createContext<NotificationsContextType | null>(null);

/* -------------------------------------------------------------------------- */
/* Storage key */
/* -------------------------------------------------------------------------- */

const NOTIFICATIONS_STORAGE_KEY = "brocode_notifications";

/* -------------------------------------------------------------------------- */
/* Provider */
/* -------------------------------------------------------------------------- */

export function NotificationsProvider({ children }: { children: ReactNode }) {
  /* ------------------------------------------------------------------------ */
  /* Load notifications from localStorage */
  /* ------------------------------------------------------------------------ */

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  /* ------------------------------------------------------------------------ */
  /* Persist notifications */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    localStorage.setItem(
      NOTIFICATIONS_STORAGE_KEY,
      JSON.stringify(notifications)
    );
  }, [notifications]);

  /* ------------------------------------------------------------------------ */
  /* Create notification ONLY when called explicitly */
  /* ------------------------------------------------------------------------ */

  const notify = (title: string, message: string) => {
    const newNotification: Notification = {
      id: crypto.randomUUID(),
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    notify,
    markAsRead,
    markAllAsRead,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

/* -------------------------------------------------------------------------- */
/* Hook */
/* -------------------------------------------------------------------------- */

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationsProvider"
    );
  }
  return context;
}
