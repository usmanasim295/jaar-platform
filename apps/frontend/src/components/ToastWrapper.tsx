'use client';

import { ToastContainer } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import 'react-toastify/dist/ReactToastify.css';

const ToastWrapper = () => {
  const { i18n } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [isRTL, setIsRTL] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    const handleLanguageChange = () => {
      setIsRTL(i18n.language === 'ar');
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, [i18n]);

  if (!isClient) {
    return null;
  }
  
  return (
    <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={true}
      rtl={isRTL}
      pauseOnFocusLoss={true}
      draggable={true}
      pauseOnHover={true}
      theme="light"
      limit={5}
    />
  );
};

export default ToastWrapper;
