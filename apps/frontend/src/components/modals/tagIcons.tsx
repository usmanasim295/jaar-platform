import React from 'react';
import {
  Airconditioner,
  Cable,
  Cleaning,
  PainterIcon,
  PestControl,
  PlumberIcon,
} from '@/components/assets/icons';

export const tagIcons: Record<string, React.ReactNode> = {
  'AC Services': <Airconditioner className="w-4 h-4" />,
  'Cleaning Services': <Cleaning className="w-4 h-4" />,
  Electrician: <Cable className="w-4 h-4" />,
  Painter: <PainterIcon className="w-4 h-4" />,
  Plumber: <PlumberIcon className="w-4 h-4" />,
  'Pest Control': <PestControl className="w-4 h-4" />,
};
