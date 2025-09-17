import {View, Text} from 'react-native';
import React from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {NavigationContainer} from '@react-navigation/native';
import {Provider} from 'react-redux';
import {PersistGate} from 'redux-persist/integration/react';
import {persistor, store} from './src/redux/store';
import RootNavigationStackWrapper from './src/navigation/rootNavigationStackWrapper';
import RequestService from './src/screens/additionalScreens/externalServices/requestService';
import CreateRfq from './src/screens/additionalScreens/createRfq/createRfq';
import BottomSheet from './src/components/bottomSheet/bottomSheet';

const App = () => {
  return (
    <GestureHandlerRootView>
      <SafeAreaProvider>
        <NavigationContainer>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
              <RootNavigationStackWrapper />
              {/* <Home /> */}
              {/* <ManageBills /> */}
              {/* <AccountSetting /> */}
              {/* <Rfqs /> */}
              {/* <ContractDetails /> */}
              {/* <RequestService /> */}
              {/* <CreateRfq /> */}
              {/* <BottomSheet /> */}
            </PersistGate>
          </Provider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
