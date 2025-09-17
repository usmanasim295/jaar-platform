import {
  View,
  Text,
  TouchableWithoutFeedback,
  Keyboard,
  useColorScheme,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import React, {useEffect, useRef} from 'react';
import {Layout} from '../generalStyles/layout';
import RootStackNavigation from './rootStackNavigation';

const RootNavigationStackWrapper = ({navigation}) => {
  return (
    <View style={Layout.authWrapperContainer}>
      <StatusBar
        backgroundColor={'black'}
        barStyle="light-content"
        translucent={false}
      />
      <SafeAreaView style={{flex: 1}}>
        <RootStackNavigation />
      </SafeAreaView>
    </View>
  );
};

export default RootNavigationStackWrapper;
