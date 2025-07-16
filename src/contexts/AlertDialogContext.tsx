import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface AlertDialogContextType {
  showAlert: (message: string, title?: string) => Promise<void>;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export const useAlertDialog = () => {
  const ctx = useContext(AlertDialogContext);
  if (!ctx) throw new Error('useAlertDialog must be used within AlertDialogProvider');
  return ctx;
};

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>(undefined);
  const [resolver, setResolver] = useState<(() => void) | null>(null);

  const showAlert = useCallback((msg: string, t?: string) => {
    setMessage(msg);
    setTitle(t);
    setOpen(true);
    return new Promise<void>((resolve) => {
      setResolver(() => () => resolve());
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (resolver) resolver();
    setResolver(null);
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title || 'Notice'}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};