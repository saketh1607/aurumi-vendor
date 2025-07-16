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
  showConfirm: (message: string, title?: string) => Promise<boolean>;
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
  const [resolver, setResolver] = useState<((result?: boolean) => void) | null>(null);
  const [mode, setMode] = useState<'alert' | 'confirm'>('alert');

  const showAlert = useCallback((msg: string, t?: string) => {
    setMessage(msg);
    setTitle(t);
    setMode('alert');
    setOpen(true);
    return new Promise<void>((resolve) => {
      setResolver(() => () => resolve());
    });
  }, []);

  const showConfirm = useCallback((msg: string, t?: string) => {
    setMessage(msg);
    setTitle(t);
    setMode('confirm');
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => (result: boolean) => resolve(result));
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (resolver) resolver(mode === 'alert' ? undefined : false);
    setResolver(null);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (resolver) resolver(true);
    setResolver(null);
  };

  return (
    <AlertDialogContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{title || (mode === 'confirm' ? 'Confirm' : 'Notice')}</AlertDialogTitle>
            <AlertDialogDescription style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{message}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            {mode === 'confirm' ? (
              <>
                <AlertDialogAction onClick={handleConfirm}>OK</AlertDialogAction>
                <AlertDialogCancel onClick={handleClose}>Cancel</AlertDialogCancel>
              </>
            ) : (
              <AlertDialogAction onClick={handleClose}>OK</AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
};