import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {
  ShieldSlash,
  LockKey,
  CreditCard,
  SignOut,
  UserProfile,
  NotificationBell,
  CareRight,
} from '../../../assets/svgs/index';

import {Fonts} from '../../../generalStyles/fontStyles';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {Colors} from '../../../generalStyles/theme';
import {Layout} from '../../../generalStyles/layout';
import {styles} from './styles/styles';
import CustomButton from '../../../components/customButton/customButton';
import {CommonStyles} from '../../authentication/commonStyles/commonStyles';
import {useDispatch} from 'react-redux';
import {AuthSlice} from '../../../redux/slices/authSlice';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticationStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {MainSlice} from '../../../redux/slices/mainSlice';
import {useTranslation} from 'react-i18next';
import LangChanger from '../../../components/langChanger/langChanger';

const Profile = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const {t} = useTranslation();

  const logout = () => {
    dispatch(AuthSlice.actions.logout());
    dispatch(MainSlice.actions.set_active_screen('Home'));
    navigation.navigate(RootStackConfig.nestedStacks.authStack.route, {
      screen: AuthenticationStack.nestedScreens.signin.route,
    });
  };

  const sections = [
    {
      title: t('account'),
      height: HEIGHT_BASE_RATIO(144),
      items: [
        {
          label: t('accountInformation'),
          icon: <UserProfile width={24} height={24} />,
        },
        {label: t('notifications'), icon: <NotificationBell />},
      ],
    },
    {
      title: t('privacy'),
      height: HEIGHT_BASE_RATIO(235),
      items: [
        {label: t('security'), icon: <LockKey />},
        {label: t('loginDetails'), icon: <SignOut />},
        {label: t('billing'), icon: <CreditCard />},
        {label: t('privacyPolicy'), icon: <ShieldSlash />},
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <LangChanger />
      {sections.map((section, index) => (
        <View key={index} style={[styles.sectionBox]}>
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.items.map((item, id) => (
            <TouchableOpacity key={id} style={styles.itemRow}>
              <View style={styles.itemIconAndTitleContainer}>
                {item.icon}
                <Text style={styles.itemLabel}>{item.label}</Text>
              </View>
              <CareRight width={24} height={24} />
            </TouchableOpacity>
          ))}
        </View>
      ))}
      <CustomButton
        text={'Log Out'}
        backgroundColor={Colors.Red}
        textStyle={CommonStyles.buttonText}
        additionalCommonStyles={CommonStyles.button}
        width="100%"
        height={HEIGHT_BASE_RATIO(60)}
        borderColor={Colors.White}
        onPress={logout}
        borderRadius={12}
      />
    </View>
  );
};

export default Profile;
