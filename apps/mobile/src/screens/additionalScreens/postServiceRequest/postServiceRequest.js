import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Formik} from 'formik';
import * as Yup from 'yup';
import moment from 'moment';

import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import CustomTextInput from '../../../components/textInput/textInput';
import ToggleSwitch from '../../../components/toggleSwitch/toggleSwitch';
import CalendarModal from '../../../components/calendarModal/calendarModal';

import {styles} from './styles/styles';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Calendar, Clock} from '../../../assets/icons';
import {useSelector} from 'react-redux';
import {CreateJobApi} from '../../../services/apis/jobs/createJob';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {RootStackConfig} from '../../../constants/screenRoutes';

const validationSchema = Yup.object().shape({
  title: Yup.string().required('Job Title is required'),
  location: Yup.string().required('Location is required'),
  charges: Yup.number()
    .typeError('Charges must be a number')
    .positive('Charges must be greater than 0')
    .required('Charges are required'),
  description: Yup.string().required('Description is required'),
  workDuration: Yup.string()
    .matches(/^\d+\s*-\s*\d/, 'Enter in format: e.g. 8-11 ')
    .required('Work Duration is required'),
  experienceLevel: Yup.string().required('Experience Level is required'),
});

const PostServiceRequest = () => {
  const navigation = useNavigation();
  const state = useSelector(state => state.auth);
  const {user} = state;
  const {params} = useRoute();
  const [startDate, setStartDate] = useState(params?.startDate || null);
  const [endDate, setEndDate] = useState(params?.endDate || null);
  const [notifyOwner, setNotifyOwner] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleToggle = isOn => setNotifyOwner(isOn);

  const handleOpenModal = field => {
    if (field === 'end' && !startDate) {
      Alert.alert('Error', 'Please select a start date first.');
      return;
    }
    setActiveField(field);
    setModalVisible(true);
  };
  const handleDateSelect = date => {
    if (activeField === 'start') {
      setStartDate(date);
      if (endDate && moment(endDate).isBefore(moment(date))) {
        setEndDate(null); // reset end date if it's before new start
      }
    } else if (activeField === 'end') {
      if (moment(date).isBefore(moment(startDate))) {
        Alert.alert('Error', 'End date cannot be earlier than start date.');
        return;
      }
      setEndDate(date);
    }
    setModalVisible(false);
  };
  const handleLoading = loading => {
    setLoading(loading);
  };
  const handleCreateJob = async values => {
    const data = JSON.stringify({
      ...values,
      serviceIds: [params?.service?.id],
      apartmentId: user?.apartment?.id,
      jobType: params?.jobType,
    });
    console.log('data', data);
    const response = await CreateJobApi(handleLoading, data);
    if (response) {
      console.log('response', response);
      Alert.alert('Success', 'Job Posted Successfully');
      navigation.goBack();
    }
  };
  return (
    <View style={styles.screen}>
      <NestedHeader screen={'Post Job'} />
      <Formik
        initialValues={{
          title: params?.service?.name || '',
          location: params?.location || '',
          charges: params?.charges ? String(params?.charges) : '',
          description: params?.service?.description || '',
          timeSlot: params?.timeSlot || '',
          workDuration: params?.workDuration || '',
          experienceLevel: params?.experienceLevel || '',
        }}
        validationSchema={validationSchema}
        validateOnBlur={true}
        validateOnChange={false}
        validateOnMount={false}
        onSubmit={values => {
          handleCreateJob({
            ...values,
            charges: values.charges + ' SAR',
            startDate,
            endDate,
          });
        }}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          submitCount,
        }) => (
          <>
            <KeyboardAwareScrollView
              style={styles.scroll}
              contentContainerStyle={[styles.content]}
              keyboardShouldPersistTaps="handled">
              {/* Job Title */}
              <CustomTextInput
                placeholder="Job Title"
                value={values.title}
                onChangeText={handleChange('title')}
                onBlur={handleBlur('title')}
              />
              {(touched.title || submitCount > 0) && errors.title && (
                <Text style={{color: 'red'}}>{errors.title}</Text>
              )}

              {/* Location */}
              <View style={styles.margin}>
                <CustomTextInput
                  placeholder="Location"
                  value={values.location}
                  onChangeText={handleChange('location')}
                  onBlur={handleBlur('location')}
                />
                {(touched.location || submitCount > 0) && errors.location && (
                  <Text style={{color: 'red'}}>{errors.location}</Text>
                )}
              </View>
              {/* Charges */}
              <CustomTextInput
                placeholder="Charges"
                value={values.charges ? `${values.charges} SAR` : ''}
                onChangeText={text => {
                  // Remove non-digits (like SAR, spaces)
                  const numericValue = text.replace(/[^0-9]/g, '');
                  handleChange('charges')(numericValue);
                }}
                onBlur={handleBlur('charges')}
                keyboardType="numeric"
              />

              {(touched.charges || submitCount > 0) && errors.charges && (
                <Text style={{color: 'red'}}>{errors.charges}</Text>
              )}

              {/* Description */}
              <CustomTextInput
                placeholder="Description"
                value={values.description}
                onChangeText={handleChange('description')}
                onBlur={handleBlur('description')}
                additionalStyles={[styles.textArea]}
                multiline={true}
              />
              {(touched.description || submitCount > 0) &&
                errors.description && (
                  <Text style={{color: 'red'}}>{errors.description}</Text>
                )}
              <CustomTextInput
                placeholder="Work Duration (e.g. 8-11 hours)"
                value={values.workDuration}
                onChangeText={handleChange('workDuration')}
                onBlur={handleBlur('workDuration')}
                additionalStyles={{marginTop: HEIGHT_BASE_RATIO(16)}}
              />
              {(touched.workDuration || submitCount > 0) &&
                errors.workDuration && (
                  <Text style={{color: 'red'}}>{errors.workDuration}</Text>
                )}
              <CustomTextInput
                placeholder="Experience Level (e.g. Beginner, Intermediate, Expert)"
                value={values.experienceLevel}
                onChangeText={handleChange('experienceLevel')}
                onBlur={handleBlur('experienceLevel')}
                additionalStyles={{marginTop: HEIGHT_BASE_RATIO(16)}}
              />
              {(touched.experienceLevel || submitCount > 0) &&
                errors.experienceLevel && (
                  <Text style={{color: 'red'}}>{errors.experienceLevel}</Text>
                )}
              {/* Date & Time */}
              <View style={styles.dateTimeContainer}>
                {/* Start Date */}
                <TouchableOpacity
                  style={styles.dateAndTimeBtn}
                  onPress={() => handleOpenModal('start')}>
                  <View style={styles.titleValueGap}>
                    <Text style={styles.dateAndTimeBtnText}>Start Date</Text>
                    <Text style={styles.datetext}>
                      {startDate
                        ? moment(startDate).format('DD/MM/YYYY')
                        : 'Pick Start Date'}
                    </Text>
                  </View>
                  <Calendar />
                </TouchableOpacity>

                {/* End Date */}
                <TouchableOpacity
                  style={styles.dateAndTimeBtn}
                  onPress={() => {
                    handleOpenModal('end');
                  }}>
                  <View style={styles.titleValueGap}>
                    <Text style={styles.dateAndTimeBtnText}>End Date</Text>
                    <Text style={styles.datetext}>
                      {endDate
                        ? moment(endDate).format('DD/MM/YYYY')
                        : 'Pick End Date'}
                    </Text>
                  </View>
                  <Calendar />
                </TouchableOpacity>
              </View>

              {/* Time Slot */}
              <TouchableOpacity style={[styles.dateAndTimeBtn, styles.margin]}>
                <View style={styles.titleValueGap}>
                  <Text style={styles.time}>Time Slot</Text>
                  <Text style={styles.timeslot}>
                    {values.timeSlot || 'Select Time Slot'}
                  </Text>
                </View>
                <Clock />
              </TouchableOpacity>

              {/* Notify Owner */}
              <View style={styles.notifyOwner}>
                <Text style={Fonts.Jakarta_Sans_Regular_14_Black}>
                  Notify Homeowner
                </Text>
                <ToggleSwitch isOn={notifyOwner} onToggle={handleToggle} />
              </View>
            </KeyboardAwareScrollView>

            {/* Calendar Modal */}
            <CalendarModal
              visible={modalVisible}
              onClose={() => setModalVisible(false)}
              onSelectDate={handleDateSelect}
              title={
                activeField === 'start' ? 'Pick Start Date' : 'Pick End Date'
              }
            />

            {/* Submit Button */}
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.nextBtn}
                onPress={!loading && handleSubmit}>
                {loading ? (
                  <ActivityIndicator />
                ) : (
                  <Text style={styles.nextText}>Post Job</Text>
                )}
              </TouchableOpacity>
            </View>
          </>
        )}
      </Formik>
    </View>
  );
};

export default PostServiceRequest;
