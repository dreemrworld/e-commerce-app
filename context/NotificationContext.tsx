
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';

type NotificationType = 'success' | 'error' | 'info';

interface NotificationState {
  message: string;
  type: NotificationType;
  isVisible: boolean;
  id: number; // To handle multiple rapid notifications if needed, though current hides previous
}

interface NotificationContextType {
  notification: NotificationState | null;
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [timerId, setTimerId] = useState<number | null>(null); // Changed NodeJS.Timeout to number

  const hideNotification = useCallback(() => {
    if (timerId) {
      clearTimeout(timerId);
      setTimerId(null);
    }
    setNotification(prev => prev ? { ...prev, isVisible: false } : null);
    // Optional: Fully clear notification after transition out
    // setTimeout(() => setNotification(null), 300); // Match transition duration
  }, [timerId]);

  const showNotification = useCallback((
    message: string,
    type: NotificationType = 'success',
    duration: number = 3000
  ) => {
    // If a notification is already showing, hide it first
    if (notification && notification.isVisible) {
        hideNotification();
        // Show new notification after a short delay to allow old one to transition out
        setTimeout(() => {
            const newNotification: NotificationState = { message, type, isVisible: true, id: Date.now() };
            setNotification(newNotification);
            const newTimerId = setTimeout(() => {
              hideNotification();
            }, duration);
            setTimerId(newTimerId);
        }, 150); // Adjust delay as needed
    } else {
        const newNotification: NotificationState = { message, type, isVisible: true, id: Date.now() };
        setNotification(newNotification);
        const newTimerId = setTimeout(() => {
          hideNotification();
        }, duration);
        setTimerId(newTimerId);
    }
  }, [hideNotification, notification]);


  return (
    <NotificationContext.Provider value={{ notification, showNotification, hideNotification }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};