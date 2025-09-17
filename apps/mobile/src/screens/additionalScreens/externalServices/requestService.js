import {View, Text, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import {Layout} from '../../../generalStyles/layout';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {Cleaning, House, Support} from '../../../assets/icons';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Colors} from '../../../generalStyles/theme';
import {styles} from './styles/styles';
import {Fonts} from '../../../generalStyles/fontStyles';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {
  CleaningServicesWhite,
  HomeServiceWhite,
  ServiceBackground,
  SupportWhite,
} from '../../../assets/images';
import {useTranslation} from 'react-i18next';

const RequestService = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  return (
    <View style={[Layout.container, Layout.generalPaddingHorizontal]}>
      <NestedHeader screen={'Request Service'} />
      {/* <View style={styles.rowServiceCardsContainer}>
        <TouchableOpacity
          style={styles.rowServicesCard}
          onPress={() =>
            navigation.navigate(
              RootStackConfig.nestedStacks.additionalScreensStack.route,
              {
                screen:
                  AdditionalScreensStack.nestedScreens.chooseServices.route,
                params: {
                  screen: 'Home Services',
                  icon: <Image source={HomeServiceWhite} style={styles.icon} />,
                },
              },
            )
          }>
          <House />
          <Text style={Fonts.Jakarta_Sans_SemiBold_14_Black}>
            {t('homeServices')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rowServicesCard}
          onPress={() =>
            navigation.navigate(
              RootStackConfig.nestedStacks.additionalScreensStack.route,
              {
                screen:
                  AdditionalScreensStack.nestedScreens.chooseServices.route,
                params: {
                  screen: 'Cleaning House',
                  icon: (
                    <Image source={CleaningServicesWhite} style={styles.icon} />
                  ),
                },
              },
            )
          }>
          <Cleaning />
          <Text style={Fonts.Jakarta_Sans_SemiBold_14_Black}>
            {t('cleaningHouse')}
          </Text>
        </TouchableOpacity>
      </View> */}
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() =>
          navigation.navigate(
            RootStackConfig.nestedStacks.additionalScreensStack.route,
            {
              screen: AdditionalScreensStack.nestedScreens.chooseServices.route,
              params: {
                screen: 'Home Services',
                icon: <Image source={HomeServiceWhite} style={styles.icon} />,
                type: 'HOME_SERVICE',
              },
            },
          )
        }>
        <House />
        <Text style={Fonts.Jakarta_Sans_SemiBold_14_Black}>Home Services</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.serviceCard}
        onPress={() =>
          navigation.navigate(
            RootStackConfig.nestedStacks.additionalScreensStack.route,
            {
              screen: AdditionalScreensStack.nestedScreens.chooseServices.route,
              params: {
                screen: 'Community Services',
                icon: <Image source={SupportWhite} style={styles.icon} />,
                type: 'COMMUNITY_SERVICE',
              },
            },
          )
        }>
        <Support />
        <Text style={Fonts.Jakarta_Sans_SemiBold_14_Black}>
          {t('communityServices')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default RequestService;
