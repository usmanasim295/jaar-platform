import React, {useState} from 'react';
import {View, Text, TouchableOpacity, Alert} from 'react-native';
import moment from 'moment';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {
  Airconditioner,
  Cleaning,
  Cable,
  Painter,
  Plumber,
  PestControl,
  CaretDown,
  Check,
  MapPinGray,
  Calendar,
  Clock,
} from '../../../assets/icons';
import {Fonts} from '../../../generalStyles/fontStyles';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import CustomTextInput from '../../../components/textInput/textInput';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {styles} from './styles/styles';
import {useNavigation} from '@react-navigation/native';
import {
  AdditionalScreensStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import CalendarModal from '../../../components/calendarModal/calendarModal';
import {useTranslation} from 'react-i18next';

const CreateRfq = () => {
  const navigation = useNavigation();
  const {t} = useTranslation();

  const [selected, setSelected] = useState(null);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeField, setActiveField] = useState(null); // "start" | "end"
  const services = [
    {
      id: 1,
      name: t('acServices'),
      icon: <Airconditioner width={40} height={40} />,
    },
    {
      id: 2,
      name: t('cleaning'),
      icon: <Cleaning width={40} height={40} />,
    },
    {
      id: 3,
      name: t('electrician'),
      icon: <Cable width={40} height={40} />,
    },
    {
      id: 4,
      name: t('plumber'),
      icon: <Plumber width={40} height={40} />,
    },
    {
      id: 5,
      name: t('painter'),
      icon: <Painter width={40} height={40} />,
    },
    {
      id: 6,
      name: t('pestControl'),
      icon: <PestControl width={40} height={40} />,
    },
  ];
  const handleOpenModal = field => {
    if (field === 'end' && !startDate) {
      Alert.alert(t('error'), t('errorInvalidEndDate'));
      return;
    }
    setActiveField(field);
    setModalVisible(true);
  };

  const handleDateSelect = date => {
    if (activeField === 'start') {
      setStartDate(date);
      setEndDate(null); // reset end date if start changes
    } else if (activeField === 'end') {
      if (moment(date).isBefore(moment(startDate))) {
        Alert.alert('Error', 'End date cannot be earlier than start date.');
        return;
      }
      setEndDate(date);
    }
  };

  return (
    <View style={styles.screen}>
      <NestedHeader screen={t('createRFQ')} />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {paddingBottom: HEIGHT_BASE_RATIO(120)},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* Job Title + Description */}
        <CustomTextInput
          placeholder={'Job Title'}
          additionalStyles={styles.margin}
        />
        <CustomTextInput
          placeholder={'Description'}
          additionalStyles={[styles.textArea]}
          multiline
        />

        <Text style={styles.sectionTitle}>{t('chooseServices')}</Text>
        <View style={styles.grid}>
          {services.map(item => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.9}
              onPress={() => setSelected(item.id)}
              style={[
                styles.card,
                selected === item.id && styles.cardSelected,
              ]}>
              <Text style={styles.cardIcon}>{item.icon}</Text>
              <Text style={styles.cardLabel}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <CustomTextInput
          placeholder={t('charges')}
          additionalStyles={styles.marginTop}
        />
        <TouchableOpacity style={styles.durationBtn}>
          <Text style={Fonts.Jakarta_Sans_Regular_14_Grey}>
            {t('workDuration')}
          </Text>
          <CaretDown />
        </TouchableOpacity>

        {/* Start & End Dates */}
        <View style={styles.dateContainer}>
          {/* Start Date */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => handleOpenModal('start')}>
            <View style={styles.titleValueGap}>
              <Text style={Fonts.Jakarta_Sans_Regular_12_Grey}>
                {t('startDate')}
              </Text>
              <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>
                {startDate || t('select')}
              </Text>
            </View>
            <Calendar />
          </TouchableOpacity>

          {/* End Date */}
          <TouchableOpacity
            style={styles.dateBtn}
            onPress={() => handleOpenModal('end')}>
            <View style={styles.titleValueGap}>
              <Text style={Fonts.Jakarta_Sans_Regular_12_Grey}>
                {t('endDate')}
              </Text>
              <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>
                {endDate || t('select')}
              </Text>
            </View>
            <Calendar />
          </TouchableOpacity>
        </View>

        {/* Time Slot */}
        <TouchableOpacity style={styles.timeBtn}>
          <View style={styles.titleValueGap}>
            <Text style={Fonts.Jakarta_Sans_Regular_12_Grey}>
              {t('timeSlot')}
            </Text>
            <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>3:00 PM</Text>
          </View>
          <Clock />
        </TouchableOpacity>

        <CustomTextInput
          placeholder={t('location')}
          additionalStyles={styles.margin}
          iconRight={<MapPinGray />}
        />
      </KeyboardAwareScrollView>

      {/* Calendar Modal */}
      <CalendarModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSelectDate={handleDateSelect}
        title={activeField === 'start' ? t('pickStartDate') : t('pickEndDate')}
      />

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() =>
            navigation.navigate(
              RootStackConfig.nestedStacks.additionalScreensStack.route,
              {screen: AdditionalScreensStack.nestedScreens.rfqQuestions.route},
            )
          }>
          <Text style={styles.nextText}>{t('next')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CreateRfq;
