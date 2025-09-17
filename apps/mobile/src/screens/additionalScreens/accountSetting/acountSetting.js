import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  ShieldSlash,
  LockKey,
  CreditCard,
  SignOut,
  UserProfile,
  NotificationBell,
  CareRight,
} from '../../../assets/svgs/index';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import BottomTab from '../../../components/bottomTab/bottomTab';
import {styles} from './styles/style';

const sections = [
  {
    title: 'Account',
    height: HEIGHT_BASE_RATIO(144),
    items: [
      {
        label: 'Account Information',
        icon: <UserProfile width={24} height={24} />,
      },
      {label: 'Notifications', icon: <NotificationBell />},
    ],
  },
  {
    title: 'Privacy',
    height: HEIGHT_BASE_RATIO(235),
    items: [
      {label: 'Security', icon: <LockKey />},
      {label: 'Login Details', icon: <SignOut />},
      {label: 'Billing', icon: <CreditCard />},
      {label: 'Privacy Policy', icon: <ShieldSlash />},
    ],
  },
];

const AccountSetting = () => {
  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        {sections.map((section, index) => (
          <View
            key={index}
            style={[
              styles.sectionBox,
              {
                height: section.height,
                marginBottom: index < sections.length - 1 ? 16 : 0,
              },
            ]}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.items.map((item, id) => (
              <TouchableOpacity key={id} style={styles.itemRow}>
                {item.icon}
                <Text style={styles.itemLabel}>{item.label}</Text>
                <CareRight width={24} height={24} />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    </View>
  );
};

export default AccountSetting;
