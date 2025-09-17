import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AuthenticationStack} from '../constants/screenRoutes';

const Stack = createNativeStackNavigator();

const AuthNavigation = () => {
  return (
    <Stack.Navigator
      initialRouteName={AuthenticationStack.initialRoute}
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardOverlayEnabled: true,
        animationEnabled: true,
      }}>
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.signUp.route}
        component={AuthenticationStack.nestedScreens.signUp.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.signin.route}
        component={AuthenticationStack.nestedScreens.signin.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.approveRequest.route}
        component={AuthenticationStack.nestedScreens.approveRequest.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.selectRole.route}
        component={AuthenticationStack.nestedScreens.selectRole.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.enterHOANumber.route}
        component={AuthenticationStack.nestedScreens.enterHOANumber.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.uploadDocuments.route}
        component={AuthenticationStack.nestedScreens.uploadDocuments.component}
      />
      <Stack.Screen
        name={AuthenticationStack.nestedScreens.createPassword.route}
        component={AuthenticationStack.nestedScreens.createPassword.component}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigation;
