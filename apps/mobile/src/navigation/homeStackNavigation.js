import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {HomeStack} from '../constants/screenRoutes';
import {withLayout} from '../components/mainWrapper/mainWrapper';

const Stack = createNativeStackNavigator();

const HomeStackNavigation = () => {
  return (
    <>
      <Stack.Navigator
        initialRouteName={HomeStack.initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          cardOverlayEnabled: false,
          animationEnabled: false,
          animation: 'none',
        }}>
        <Stack.Screen
          name={HomeStack.nestedScreens.home.route}
          component={withLayout(HomeStack.nestedScreens.home.component)}
        />
        <Stack.Screen
          name={HomeStack.nestedScreens.profile.route}
          component={withLayout(HomeStack.nestedScreens.profile.component)}
        />
        <Stack.Screen
          name={HomeStack.nestedScreens.services.route}
          component={withLayout(HomeStack.nestedScreens.services.component)}
        />
        <Stack.Screen
          name={HomeStack.nestedScreens.community.route}
          component={withLayout(HomeStack.nestedScreens.community.component)}
        />
      </Stack.Navigator>
    </>
  );
};

export default HomeStackNavigation;
