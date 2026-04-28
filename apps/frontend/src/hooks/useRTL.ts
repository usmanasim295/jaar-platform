'use client';

import { useEffect, useState } from 'react';
import i18n from '@/i18n';

export const useRTL = () => {
  const [isRTL, setIsRTL] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setIsRTL(i18n.language === 'ar');
  }, []);

  useEffect(() => {
    const handler = () => setIsRTL(i18n.language === 'ar');
    i18n.on('languageChanged', handler);
    return () => i18n.off('languageChanged', handler);
  }, []);

  return { isRTL, isClient };
};
