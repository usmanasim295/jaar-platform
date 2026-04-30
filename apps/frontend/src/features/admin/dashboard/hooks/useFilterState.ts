'use client';
import { useState } from 'react';
import type { FilterPreset } from '../types';

export const useFilterState = (defaultValue: FilterPreset) => {
  const [filter, setFilter] = useState<FilterPreset>(defaultValue);
  return { filter, setFilter };
};
