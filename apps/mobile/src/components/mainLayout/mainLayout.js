import {View, StyleSheet} from 'react-native';
import React from 'react';
import {Layout} from '../../generalStyles/layout';
import HeaderComponent from '../header/header';
import BottomTab from '../bottomTab/bottomTab';
import {HEIGHT_BASE_RATIO} from '../../utils/helpers';

const TAB_HEIGHT = HEIGHT_BASE_RATIO(88);

const MainLayout = ({children}) => {
  return (
    <View style={Layout.container}>
      <HeaderComponent />
      <View style={[Layout.generalPaddingHorizontal, {flex: 1}]}>
        {/* Clone children and inject paddingBottom */}
        {React.cloneElement(children, {
          contentContainerStyle: [
            children.props.contentContainerStyle,
            {paddingBottom: TAB_HEIGHT + 20},
          ],
        })}
      </View>
      <BottomTab />
    </View>
  );
};

export default MainLayout;
