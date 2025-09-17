import {View, Text} from 'react-native';
import React from 'react';
import MainLayout from '../mainLayout/mainLayout';

export const withLayout = Component => props =>
  (
    <MainLayout>
      <Component {...props} />
    </MainLayout>
  );
