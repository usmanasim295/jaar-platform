import { useState, useEffect, useRef } from 'react';

export const useNavbar = (
  isAuthenticated: boolean,
  user: any,
  refetchProfile: any
) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      refetchProfile();
    }
  }, [isAuthenticated, user?.id, refetchProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return {
    isOpen,
    setIsOpen,
    showUserMenu,
    setShowUserMenu,
    userMenuRef,
  };
};
