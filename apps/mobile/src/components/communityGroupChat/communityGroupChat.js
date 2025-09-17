import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';
import {Colors} from '../../generalStyles/theme';
import {Fonts} from '../../generalStyles/fontStyles';
import {Chat as DefaultChatIcon} from '../../assets/svgs';
import {useNavigation} from '@react-navigation/native';
import {AdditionalScreensStack} from '../../constants/screenRoutes';
import {Chat} from '../../assets/images';
import {Styles} from '../textInput/styles/styles';

const CommunityGroupChat = () => {
  const navigation = useNavigation();
  const data = {};

  const communityChats = [
    {
      title: 'Community Discussion',
      subtitle: '2 new votings online',
      date: '10/28/12',
      Icon: DefaultChatIcon,
    },
  ];
  console.log(communityChats.title);
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => {
        //        navigation.navigate(
        //   AdditionalScreensStack.route,
        //   { screen: AdditionalScreensStack.nestedScreens.communityDiscussion.route }
        // );
      }}>
      <View style={styles.tab}>
        <Image source={Chat} style={styles.Chat} />
        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.description}>{communityChats[0].title}</Text>
            <Text style={styles.date}>{communityChats[0].date}</Text>
          </View>
          <Text style={styles.tabtext}>{communityChats[0].subtitle}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default CommunityGroupChat;

const styles = StyleSheet.create({
  tab: {
    width: WIDTH_BASE_RATIO(398),
    height: HEIGHT_BASE_RATIO(92),
    borderRadius: 12,
    backgroundColor: Colors.White,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 24,
    alignSelf: 'center',
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  Chat: {
    marginRight: WIDTH_BASE_RATIO(12),
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
  tabtext: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    marginTop: 4,
  },
  date: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
  },
});
