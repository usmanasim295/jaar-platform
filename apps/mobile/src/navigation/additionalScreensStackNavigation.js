import {View, Text} from 'react-native';
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {AdditionalScreensStack, HomeStack} from '../constants/screenRoutes';

const Stack = createNativeStackNavigator();

const AdditionalScreensNavigation = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardOverlayEnabled: true,
        animationEnabled: true,
      }}>
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.communityDiscussion.route}
        component={
          AdditionalScreensStack.nestedScreens.communityDiscussion.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.directMessages.route}
        component={
          AdditionalScreensStack.nestedScreens.directMessages.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.announcements.route}
        component={AdditionalScreensStack.nestedScreens.announcements.component}
      />

      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.accountSettings.route}
        component={
          AdditionalScreensStack.nestedScreens.accountSettings.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.contractDetails.route}
        component={
          AdditionalScreensStack.nestedScreens.contractDetails.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.manageBills.route}
        component={AdditionalScreensStack.nestedScreens.manageBills.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.rfqs.route}
        component={AdditionalScreensStack.nestedScreens.rfqs.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.singleContractDetails.route}
        component={
          AdditionalScreensStack.nestedScreens.singleContractDetails.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.utilityBills.route}
        component={AdditionalScreensStack.nestedScreens.utilityBills.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.payBills.route}
        component={AdditionalScreensStack.nestedScreens.payBills.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.communityCharges.route}
        component={
          AdditionalScreensStack.nestedScreens.communityCharges.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.createRFQ.route}
        component={AdditionalScreensStack.nestedScreens.createRFQ.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.externalServices.route}
        component={
          AdditionalScreensStack.nestedScreens.externalServices.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.chooseServices.route}
        component={
          AdditionalScreensStack.nestedScreens.chooseServices.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.postServiceRequest.route}
        component={
          AdditionalScreensStack.nestedScreens.postServiceRequest.component
        }
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.rfqQuestions.route}
        component={AdditionalScreensStack.nestedScreens.rfqQuestions.component}
      />
      <Stack.Screen
        name={AdditionalScreensStack.nestedScreens.jobCompletionRequest.route}
        component={
          AdditionalScreensStack.nestedScreens.jobCompletionRequest.component
        }
      />
    </Stack.Navigator>
  );
};

export default AdditionalScreensNavigation;
