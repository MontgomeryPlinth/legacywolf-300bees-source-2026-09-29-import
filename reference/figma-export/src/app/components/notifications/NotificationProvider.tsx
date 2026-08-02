import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";

interface NotificationContextType {
  permission: NotificationPermission;
  requestPermission: () => Promise<void>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
  isSupported: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _g = globalThis as any;
const NotificationContext: ReturnType<typeof createContext<NotificationContextType | undefined>> =
  _g.__LW_NOTIFICATION_CONTEXT ?? (_g.__LW_NOTIFICATION_CONTEXT = createContext<NotificationContextType | undefined>(undefined));

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const isSupported = typeof window !== "undefined" && "Notification" in window;

  useEffect(() => {
    if (isSupported) {
      setPermission(Notification.permission);
    }
  }, [isSupported]);

  const requestPermission = async () => {
    if (!isSupported) {
      toast.error("Notifications not supported", {
        description: "Your browser doesn't support notifications.",
      });
      return;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast.success("Notifications enabled", {
          description: "You'll receive emergency alerts when needed.",
          icon: <Bell className="w-4 h-4" />,
        });
        
        // Send test notification
        new Notification("Legacy Wolf", {
          body: "Notifications are now enabled. We'll alert you in emergencies.",
          icon: "/logo.png",
          badge: "/badge.png",
        });
      } else if (result === "denied") {
        toast.error("Notifications blocked", {
          description: "Please enable notifications in your browser settings.",
          icon: <BellOff className="w-4 h-4" />,
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      toast.error("Failed to enable notifications");
    }
  };

  const sendNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported) {
      console.warn("Notifications not supported");
      return;
    }

    if (permission !== "granted") {
      console.warn("Notification permission not granted");
      return;
    }

    try {
      const notification = new Notification(title, {
        icon: "/logo.png",
        badge: "/badge.png",
        ...options,
      });

      // Auto-close after 10 seconds
      setTimeout(() => notification.close(), 10000);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        permission,
        requestPermission,
        sendNotification,
        isSupported,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
