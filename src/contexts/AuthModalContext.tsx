import React, { createContext, useContext, useState } from 'react';

type AuthView = 'login' | 'register';

interface AuthModalContextType {
  isOpen: boolean;
  view: AuthView;
  openAuthModal: (initialView?: AuthView) => void;
  closeAuthModal: () => void;
  switchView: (view: AuthView) => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<AuthView>('login');

  const openAuthModal = (initialView: AuthView = 'login') => {
    setView(initialView);
    setIsOpen(true);
  };

  const closeAuthModal = () => {
    setIsOpen(false);
  };

  const switchView = (newView: AuthView) => {
    setView(newView);
  };

  return (
    <AuthModalContext.Provider value={{ isOpen, view, openAuthModal, closeAuthModal, switchView }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}
