import {View, Text} from 'react-native';
import React from 'react';
import BottomTab from '../../../components/bottomTab/bottomTab';
import {Layout} from '../../../generalStyles/layout';
import CommunityOptions from '../../../components/communityOptions/communityOptions';

const Community = () => {
  return (
    <View style={[Layout.container, Layout.generalPaddingHorizontal]}>
      <CommunityOptions />
    </View>
  );
};

export default Community;
