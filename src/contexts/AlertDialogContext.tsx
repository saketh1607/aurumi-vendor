import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../components/ui/alert-dialog';

interface AlertDialogContextType {
  showAlertDialog: (message: string, title?: string) => void;
}

const AlertDialogContext = createContext<AlertDialogContextType | undefined>(undefined);

export const useAlertDialog = () => {
  const context = useContext(AlertDialogContext);
  if (!context) {
    throw new Error('useAlertDialog must be used within an AlertDialogProvider');
  }
  return context;
};

export const AlertDialogProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState<string | undefined>(undefined);

  const showAlertDialog = useCallback((msg: string, t?: string) => {
    setMessage(msg);
    setTitle(t);
    setOpen(true);
  }, []);

  const handleClose = () => setOpen(false);

  return (
    <AlertDialogContext.Provider value={{ showAlertDialog }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title || 'Alert'}</AlertDialogTitle>
            <AlertDialogDescription>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleClose}>OK</AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};