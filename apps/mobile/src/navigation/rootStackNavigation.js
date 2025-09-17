import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackConfig} from '../constants/screenRoutes';
import {useSelector} from 'react-redux';

const RootStack = createNativeStackNavigator();
const RootStackNavigation = () => {
  const state = useSelector(state => state.auth);
  const token = state?.token;
  return (
    <>
      <RootStack.Navigator
        initialRouteName={
          token
            ? RootStackConfig.nestedStacks.homeStack.route
            : RootStackConfig.nestedStacks.authStack.route
        }
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
          animationEnabled: true,
          cardOverlayEnabled: false,
        }}>
        <RootStack.Screen
          name={RootStackConfig.nestedStacks.authStack.route}
          component={RootStackConfig.nestedStacks.authStack.component}
        />
        <RootStack.Screen
          name={RootStackConfig.nestedStacks.homeStack.route}
          component={RootStackConfig.nestedStacks.homeStack.component}
        />
        <RootStack.Screen
          name={RootStackConfig.nestedStacks.additionalScreensStack.route}
          component={
            RootStackConfig.nestedStacks.additionalScreensStack.component
          }
        />
      </RootStack.Navigator>
    </>
  );
};

export default RootStackNavigation;
