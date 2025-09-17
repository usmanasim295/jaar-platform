import React, {useEffect, useState} from 'react';
import {View, SafeAreaView, TouchableOpacity, StyleSheet} from 'react-native';
import {Community, HomeIcon, Profile, Services} from '../../assets/svgs/index';
import {Colors} from '../../generalStyles/theme';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../utils/helpers';
import {useNavigation} from '@react-navigation/native';
import {HomeStack} from '../../constants/screenRoutes';
import {useDispatch, useSelector} from 'react-redux';
import {MainSlice} from '../../redux/slices/mainSlice';
import {DashBoard} from '../../assets/icons';
import {roles} from '../../constants/roles';

const BottomTab = () => {
  const navigation = useNavigation();
  const {activeScreen} = useSelector(state => state.main);
  const {role} = useSelector(state => state.auth);

  const dispatch = useDispatch();

  const setActiveScreen = screen => {
    dispatch(MainSlice.actions.set_active_screen(screen));
  };

  const tabs = [
    {
      key: 'Home',
      icon: role == roles.owner ? HomeIcon : DashBoard,
      width: 32,
      height: 32,
      onPress: () => {
        navigation.navigate(HomeStack.nestedScreens.home.route);
        setActiveScreen('Home');
      },
    },
    {
      key: 'Services',
      icon: Services,
      width: 32,
      height: 32,
      onPress: () => {
        navigation.navigate(HomeStack.nestedScreens.services.route);
        setActiveScreen('Services');
      },
    },
    {
      key: 'Community',
      icon: Community,
      width: 32,
      height: 32,
      onPress: () => {
        navigation.navigate(HomeStack.nestedScreens.community.route);
        setActiveScreen('Community');
      },
    },
    {
      key: 'Profile',
      icon: Profile,
      width: 24,
      height: 24,
      onPress: () => {
        navigation.navigate(HomeStack.nestedScreens.profile.route);
        setActiveScreen('Profile');
      },
    },
  ];

  return (
    <View style={styles.tab}>
      {tabs.map(({key, icon: Icon, width, height, onPress}) => (
        <TouchableOpacity
          key={key}
          style={[
            styles.tabButton,
            {
              backgroundColor:
                activeScreen === key ? 'rgba(255, 255, 255, 0.2)' : null,
            },
          ]}
          onPress={onPress}>
          <Icon width={width} height={height} />
          {activeScreen === key && <View style={styles.dot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tab: {
    position: 'absolute',
    flexDirection: 'row',
    backgroundColor: Colors.Primary,
    justifyContent: 'space-around',
    alignItems: 'center',
    alignSelf: 'center',
    width: WIDTH_BASE_RATIO(398),
    height: HEIGHT_BASE_RATIO(88),
    borderRadius: 40,
    bottom: 0,
  },
  tabButton: {
    width: FONT_SIZE(56),
    height: FONT_SIZE(56),
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },

  dot: {
    width: 2,
    height: 4,
    borderRadius: 3,
    backgroundColor: Colors.White,
    marginTop: HEIGHT_BASE_RATIO(5),
  },
});

export default BottomTab;
