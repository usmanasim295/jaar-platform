import {View, Text, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import BottomTab from '../../../components/bottomTab/bottomTab';
import {Layout} from '../../../generalStyles/layout';
import HeaderComponent from '../../../components/header/header';
import {Fonts} from '../../../generalStyles/fontStyles';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../utils/helpers';
import {styles} from './styles/styles';
import Apartment from '../../../components/apartment/apartment';
import RBSheet from 'react-native-raw-bottom-sheet';
import {
  Cardholder,
  ChatCircleDots,
  CopySimple,
  Files,
} from '../../../assets/icons';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  HomeStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {Colors} from '../../../generalStyles/theme';
import {useSelector} from 'react-redux';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';

const Home = () => {
  const navigation = useNavigation();
  const apartmentsBottomSheetRef = useRef();
  const {role} = useSelector(state => state.auth);
  const {t} = useTranslation();
  const [selectedApartment, setSelectedApartment] = useState();

  const apartments = [
    {name: 'Apartment 1', id: 870908},
    {name: 'Apartment 2', id: 88695},
    {name: 'Building 3', id: 98274},
  ];
  const buttons = [
    {
      title: t('manageBills'),
      icon: <Cardholder />,
      cardSize: 'large',
      iconBgSize: {width: 70, height: 70},
      positions: {top: 0},
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.manageBills.route,
          },
        );
      },
    },
    {
      title: role == roles.owner ? t('communityChat') : t('allChats'),
      icon: <ChatCircleDots />,
      cardSize: 'small',
      iconBgSize: {width: 40, height: 40},
      positions: {right: 0},
      onPress: () => {
        navigation.navigate(RootStackConfig.nestedStacks.homeStack.route, {
          screen: HomeStack.nestedScreens.community.route,
        });
      },
    },
    {
      title: t('rFQs'),
      icon: <Files />,
      cardSize: 'small',
      iconBgSize: {width: 40, height: 40},
      positions: {bottom: HEIGHT_BASE_RATIO(-295), left: 0},
      onPress: () => {
        navigation.navigate(
          RootStackConfig.nestedStacks.additionalScreensStack.route,
          {
            screen: AdditionalScreensStack.nestedScreens.rfqs.route,
          },
        );
      },
    },
    {
      title: t('externalServices'),
      icon: <CopySimple />,
      cardSize: 'large',
      iconBgSize: {width: 70, height: 70},
      positions: {bottom: HEIGHT_BASE_RATIO(-295), right: 0},
      onPress: () => {
        role == roles.owner &&
          navigation.navigate(
            RootStackConfig.nestedStacks.additionalScreensStack.route,
            {
              screen:
                AdditionalScreensStack.nestedScreens.externalServices.route,
            },
          );
      },
    },
  ];

  useEffect(() => {
    setSelectedApartment(apartments[0]);
  }, []);
  return (
    <View style={[Layout.container]}>
      <Text style={styles.name}>Hi, Abdul laziz 👋</Text>
      <Text style={styles.subText}>{t('welcomeBack')}</Text>
      <Text style={styles.heading}>{t('myHOAs')}</Text>
      <Apartment
        name={selectedApartment?.name}
        id={selectedApartment?.id}
        onPress={() => apartmentsBottomSheetRef.current?.open()}
        showArrow={true}
      />
      <Text style={styles.heading}>{t('whatDoYouWantDo?')}</Text>
      <View style={[styles.flexGridContainer]}>
        {buttons.map((item, index) => (
          <TouchableOpacity
            onPress={item?.onPress}
            key={index}
            style={[
              styles.card,
              {
                ...item.positions,
              },
            ]}>
            {item.title == t('rFQs') && role == roles.leader && (
              <TouchableOpacity
                style={styles.createRfqBtn}
                onPress={() =>
                  navigation.navigate(
                    RootStackConfig.nestedStacks.additionalScreensStack.route,
                    {
                      screen:
                        AdditionalScreensStack.nestedScreens.createRFQ.route,
                    },
                  )
                }>
                <Text style={Fonts.Jakarta_Sans_SemiBold_12_White}>
                  {t('createRFQ')}
                </Text>
              </TouchableOpacity>
            )}
            <View
              style={[
                styles.iconContainer,
                {
                  ...item?.iconBgSize,
                  marginBottom:
                    item?.cardSize == 'large'
                      ? HEIGHT_BASE_RATIO(30)
                      : HEIGHT_BASE_RATIO(16),
                },
              ]}>
              {item.icon}
            </View>
            <Text style={styles.label}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <RBSheet
        ref={apartmentsBottomSheetRef}
        height={HEIGHT_BASE_RATIO(478)}
        openDuration={300}
        customStyles={{
          container: styles.bottomSheetRef,
        }}>
        <ScrollView>
          <Text style={styles.bottomSheetRefHeading}>
            {t('selectApartment')}
          </Text>

          {apartments.map((item, index) => {
            return (
              <Apartment
                name={item.name}
                id={item.id}
                key={index}
                marginTop={HEIGHT_BASE_RATIO(16)}
                onPress={() => {
                  setSelectedApartment(item);
                  apartmentsBottomSheetRef.current?.close();
                }}
              />
            );
          })}
        </ScrollView>
      </RBSheet>
    </View>
  );
};

export default Home;
