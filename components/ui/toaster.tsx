'use client';

import * as React from "react";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";

// Simple toast state management
let toastCount = 0;
const listeners: Array<(toasts: ToastData[]) => void> = [];
let toasts: ToastData[] = [];

interface ToastData {
  id?: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  variant?: string;
}

const addToast = (toast: ToastData) => {
  const id = (++toastCount).toString();
  const newToast = { ...toast, id };
  toasts = [newToast, ...toasts.slice(0, 1)]; // Limit to 1 toast
  listeners.forEach(listener => listener(toasts));
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    toasts = toasts.filter(t => t.id !== id);
    listeners.forEach(listener => listener(toasts));
  }, 5000);
};

const removeToast = (id: string) => {
  toasts = toasts.filter(t => t.id !== id);
  listeners.forEach(listener => listener(toasts));
};

// Export the toast function for use in components
export const toast = addToast;

export function Toaster() {
  const [toastList, setToastList] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    const listener = (newToasts: ToastData[]) => setToastList(newToasts);
    listeners.push(listener);
    setToastList(toasts);
    
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return (
    <ToastProvider>
      {toastList.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props} variant={props.variant as "default" | "destructive" | undefined}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && (
              <ToastDescription>{description}</ToastDescription>
            )}
          </div>
          {action}
          <ToastClose onClick={() => removeToast(id!)} />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
