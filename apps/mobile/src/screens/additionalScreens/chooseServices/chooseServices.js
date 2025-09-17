import {
  View,
  Text,
  ImageBackground,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {useSelector} from 'react-redux';
import {Layout} from '../../../generalStyles/layout';
import CustomTextInput from '../../../components/textInput/textInput';
import {ServiceBackground} from '../../../assets/images';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import Svg, {Defs, RadialGradient, Rect, Stop, Circle} from 'react-native-svg';
import {styles} from './styles/styles';
import {Fonts} from '../../../generalStyles/fontStyles';
import {
  Airconditioner,
  Cable,
  Cleaning,
  MagniFyingGlass,
  Painter,
  PestControl,
  Plumber,
} from '../../../assets/icons';
import RBSheet from 'react-native-raw-bottom-sheet';
import moment from 'moment';
import {Colors} from '../../../generalStyles/theme';
import CustomButton from '../../../components/customButton/customButton';
import {GetAllServicesApi} from '../../../services/apis/services/services';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  HomeStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {useTranslation} from 'react-i18next';

const {width} = Dimensions.get('window');

const ChooseServices = ({route}) => {
  const navigation = useNavigation();
  const {screen} = route.params;
  const {icon} = route.params;
  const {type} = route.params;
  const serviceBottomSheetRef = useRef();
  const {t} = useTranslation();

  const [selectedService, setSelectedService] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState(null);

  const localIcons = [
    {
      id: 1,
      name: 'AC Services',
      icon: <Airconditioner width={40} height={40} />,
    },
    {
      id: 2,
      name: 'Cleaning Services',
      icon: <Cleaning width={40} height={40} />,
    },
    {id: 3, name: 'Electrician', icon: <Cable width={40} height={40} />},
    {id: 4, name: 'Plumber', icon: <Plumber width={40} height={40} />},
    {id: 5, name: 'Painter', icon: <Painter width={40} height={40} />},
    {id: 6, name: 'Pest Control', icon: <PestControl width={40} height={40} />},
  ];

  const onSelectDate = date => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(null);
    } else if (!endDate && moment(date).isAfter(moment(startDate))) {
      setEndDate(date);
    } else {
      // restart selection
      setStartDate(date);
      setEndDate(null);
    }
  };
  const handleLoading = () => {
    setLoading(true);
  };
  const mapServicesWithIcons = (backendServices, iconMappings) => {
    return backendServices.map(service => {
      const match = iconMappings.find(iconObj => iconObj.name === service.name);
      return {
        ...service,
        icon: match ? match.icon : null, // assign icon if found, else null
      };
    });
  };
  const getAllServices = async () => {
    const response = await GetAllServicesApi(handleLoading);
    if (response) {
      console.log('services', response);
      setServices(mapServicesWithIcons(response, localIcons));
    }
  };
  const generateDates = () => {
    const today = moment();
    const daysInMonth = today.daysInMonth();
    let dates = [];

    for (let i = today.date(); i <= daysInMonth; i++) {
      let date = moment().date(i);
      dates.push({
        id: date.format('YYYY-MM-DD'),
        dayNumber: date.format('D'),
        dayName: date.format('ddd'),
      });
    }

    return dates;
  };

  const dates = generateDates();

  const timeSlots = ['4–5pm', '5–6pm', '6–7pm', '7–8pm'];

  console.log('type', type);
  useEffect(() => {
    getAllServices();
  }, []);
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <View style={{flex: 1}}>
        <NestedHeader screen={screen} />
        <View style={[Layout.container, Layout.generalPaddingHorizontal]}>
          <CustomTextInput
            placeholder={t('search')}
            iconLeft={<MagniFyingGlass />}
            textInputStyles={styles.searchTextInput}
            additionalStyles={styles.searchTextInputContainer}
          />
          <View style={styles.container}>
            <View style={styles.serviceCardInnerContainer}>
              <Svg height="100%" width="100%">
                <Defs>
                  <RadialGradient id="grad" cx="50%" cy="55%" r="55%">
                    <Stop offset="75%" stopColor="#2E6C84" stopOpacity="0.15" />
                    <Stop offset="100%" stopColor="#000" stopOpacity="0.15" />
                  </RadialGradient>
                </Defs>
                <Circle cx={width - 100} cy={100} r="60" fill="url(#grad)" />
                <Circle cx={width - 200} cy={90} r="20" fill="url(#grad)" />
                <Circle cx={width - 110} cy={10} r="20" fill="url(#grad)" />
              </Svg>
              <View style={styles.serviceCardTitleContainer}>
                {icon}
                <Text style={Fonts.Jakarta_Sans_SemiBold_16_White}>
                  {screen}
                </Text>
              </View>
            </View>
          </View>
          <View style={styles.grid}>
            {services?.map(item => (
              <TouchableOpacity
                key={item.id}
                onPress={() => {
                  setSelectedService(item);
                  serviceBottomSheetRef?.current?.open();
                }}
                style={styles.card}>
                <View style={styles.cardIcon}>{item.icon}</View>
                <Text style={styles.cardLabel}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <RBSheet
          ref={serviceBottomSheetRef}
          height={HEIGHT_BASE_RATIO(430)}
          openDuration={300}
          customStyles={{
            container: styles.bottomSheetRef,
          }}>
          <View style={styles.requestServiceGap}>
            <Text style={styles.bottomSheetRefHeading}>
              {t('requestService')}
            </Text>
            <Text
              style={[
                styles.bottomSheetSubHeading,
                styles.bottomSheetSubHeadingMarginTop,
              ]}>
              {t('selectDate')}
            </Text>
            <FlatList
              data={dates}
              horizontal
              keyExtractor={item => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateBoxGap}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.dateBox,
                    {
                      borderColor:
                        startDate === item.id || endDate === item.id
                          ? Colors.Green
                          : Colors.Stroke,
                      backgroundColor:
                        startDate === item.id || endDate === item.id
                          ? Colors.LightGreen
                          : Colors.White,
                    },
                  ]}
                  onPress={() => onSelectDate(item.id)}>
                  <Text
                    style={[
                      Fonts.Jakarta_Sans_Bold_18_Black,
                      {
                        color:
                          startDate === item.id || endDate === item.id
                            ? Colors.Green
                            : Colors.BlackText,
                      },
                    ]}>
                    {item.dayNumber}
                  </Text>
                  <Text
                    style={[
                      Fonts.Jakarta_Sans_Regular_14_Black,
                      {
                        color:
                          startDate === item.id || endDate === item.id
                            ? Colors.Green
                            : Colors.BlackText,
                      },
                    ]}>
                    {item.dayName}
                  </Text>
                </TouchableOpacity>
              )}
            />
            <Text style={[styles.bottomSheetSubHeading]}>
              {t('selectTimeSlot')}
            </Text>
            <FlatList
              data={timeSlots}
              horizontal
              keyExtractor={(item, index) => index.toString()}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dateBoxGap}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={[
                    styles.timeBox,
                    {
                      borderColor:
                        selectedTime === item ? Colors.Green : Colors.Stroke,
                      backgroundColor:
                        selectedTime === item
                          ? Colors.LightGreen
                          : Colors.White,
                    },
                  ]}
                  onPress={() => setSelectedTime(item)}>
                  <Text
                    style={[
                      styles.timeText,
                      {
                        color:
                          selectedTime === item
                            ? Colors.Green
                            : Colors.BlackText,
                      },
                    ]}>
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />

            <CustomButton
              text={'Request Service'}
              onPress={() => {
                serviceBottomSheetRef?.current?.close();
                navigation.navigate(
                  RootStackConfig.nestedStacks.additionalScreensStack.route,
                  {
                    screen:
                      AdditionalScreensStack.nestedScreens.postServiceRequest
                        .route,
                    params: {
                      service: selectedService,
                      startDate: startDate,
                      endDate: endDate,
                      timeSlot: selectedTime,
                      jobType: type,
                    },
                  },
                );
              }}
              additionalStyles={styles.bottomSheetBtn}
              textStyle={Fonts.Jakarta_Sans_SemiBold_16_White}
            />
          </View>
        </RBSheet>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default ChooseServices;
