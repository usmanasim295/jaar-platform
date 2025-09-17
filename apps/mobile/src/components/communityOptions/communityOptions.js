import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';
import {Colors} from '../../generalStyles/theme';
import {Fonts} from '../../generalStyles/fontStyles';
import {Chat as DefaultChatIcon} from '../../assets/svgs';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../constants/screenRoutes';
import {Chat} from '../../assets/images';
import {Styles} from '../textInput/styles/styles';
import {AnnouncementsIcon, DirectMessagesIcon} from '../../assets/icons';
import {useSelector} from 'react-redux';
import {roles} from '../../constants/roles';
import {useTranslation} from 'react-i18next';

const CommunityOptions = () => {
  const navigation = useNavigation();
  const {role} = useSelector(state => state.auth);
  const {t} = useTranslation();
  const communityOptions = [
    {
      title: 'Direct Messages',
      icon: <DirectMessagesIcon />,
      showOption: role == roles.leader,
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.directMessages.route,
          },
        );
      },
    },
    {
      title: t('communityDiscussion'),
      subtitle: t('2NewVotingsOnline'),
      date: '10/28/12',
      icon: <Image source={Chat} style={styles.chat} />,
      showOption: true,

      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen:
              AdditionalScreensStack.nestedScreens.communityDiscussion.route,
          },
        );
      },
    },
    {
      title: 'Announcements',
      subtitle: '2 new votings online',
      date: '10/28/12',
      icon: <AnnouncementsIcon />,
      showOption: role == roles.leader,

      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.announcements.route,
          },
        );
      },
    },
  ];
  return (
    <View
      style={{marginTop: HEIGHT_BASE_RATIO(10), gap: HEIGHT_BASE_RATIO(16)}}>
      {communityOptions.map((item, index) => {
        return (
          <>
            {item?.showOption && (
              <TouchableOpacity
                activeOpacity={0.7}
                style={styles.tab}
                key={index}
                onPress={item?.onPress}>
                {item?.icon}
                <View style={styles.textContainer}>
                  <Text style={styles.description}>{item.title}</Text>
                  {item.subtitle && (
                    <Text style={styles.tabText}>{item.subtitle}</Text>
                  )}
                </View>
                <Text style={styles.date}>{item.date}</Text>
              </TouchableOpacity>
            )}
          </>
        );
      })}
    </View>
  );
};

export default CommunityOptions;

const styles = StyleSheet.create({
  tab: {
    width: WIDTH_BASE_RATIO(398),
    height: HEIGHT_BASE_RATIO(92),
    borderRadius: 12,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    alignSelf: 'center',
    columnGap: WIDTH_BASE_RATIO(12),
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },

  textContainer: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  description: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Black,
  },
  tabText: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    marginTop: HEIGHT_BASE_RATIO(8),
  },
  date: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    position: 'absolute',
    right: WIDTH_BASE_RATIO(16),
    top: HEIGHT_BASE_RATIO(16),
  },
});
