'use client';

import { Provider } from 'react-redux';
import { store } from './index';
import '../i18n'; // import i18n config

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={store}>{children}</Provider>;
}
