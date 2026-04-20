import React from 'react';
import {
  AirConditionIcon,
  CleaningIcon,
  CableIcon,
  PlumberIcon,
  PainterIcon,
  PestControl,
} from '@/components/assets/icons';

export const serviceIconMap: Record<string, React.ElementType> = {
  // English names
  'AC Services': AirConditionIcon,
  'Cleaning Services': CleaningIcon,
  Electrician: CableIcon,
  Plumber: PlumberIcon,
  Painter: PainterIcon,
  'Pest Control': PestControl,
  // Arabic names
  'خدمات تكييف الهواء': AirConditionIcon,
  'خدمات التنظيف': CleaningIcon,
  كهربائي: CableIcon,
  سباك: PlumberIcon,
  رسام: PainterIcon,
  'مكافحة الآفات': PestControl,
};

export const defaultServiceIcon = CleaningIcon;
