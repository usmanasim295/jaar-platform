import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {Layout} from '../../../generalStyles/layout';
import {JAR} from '../../../assets/svgs';
import CustomTextInput from '../../../components/textInput/textInput';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../utils/helpers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../../components/customButton/customButton';
import {Colors} from '../../../generalStyles/theme';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {CommonStyles} from '../commonStyles/commonStyles';
import {styles} from './styles/styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthenticationStack} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import {useSelector} from 'react-redux';
import {t} from 'i18next';
import {useTranslation} from 'react-i18next';

const SignupSchema = Yup.object().shape({
  HOANumber: Yup.string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),
});
const EnterHOANumber = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const {t} = useTranslation();

  const handleSubmit = (values: {HOANumber: string}) => {
    navigation.navigate(
      AuthenticationStack.nestedScreens.uploadDocuments.route,
      {...params, hoaNumber: values.HOANumber},
    );
    console.log('Form Values:', values);
  };

  return (
    <KeyboardAwareScrollView
      style={[Layout.container, Layout.generalPaddingHorizontal]}
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps="handled">
      <BackButton />
      <JAR
        style={CommonStyles.jarLogo}
        width={WIDTH_BASE_RATIO(128)}
        height={HEIGHT_BASE_RATIO(136)}
      />
      <Text style={CommonStyles.heading}>{t('HOANumber')}</Text>
      <Text style={CommonStyles.subText}>{t('pleaseEnterNumberBelow')}</Text>

      <Formik
        initialValues={{HOANumber: ''}}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}>
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
        }) => (
          <>
            <View style={{gap: HEIGHT_BASE_RATIO(8)}}>
              <View>
                <CustomTextInput
                  placeholder={t('enterHOANumber')}
                  value={values.HOANumber}
                  onChangeText={handleChange('HOANumber')}
                  onBlur={handleBlur('HOANumber')}
                  error={touched.HOANumber && errors.HOANumber}
                />
                {touched.HOANumber && errors.HOANumber && (
                  <Text style={CommonStyles.errorText}>
                    {errors?.HOANumber}
                  </Text>
                )}
              </View>
            </View>

            <CustomButton
              text={t('next')}
              backgroundColor={Colors.Primary}
              textStyle={CommonStyles.buttonText}
              additionalCommonStyles={CommonStyles.button}
              width="100%"
              height={HEIGHT_BASE_RATIO(60)}
              marginTop={HEIGHT_BASE_RATIO(32)}
              borderColor={Colors.White}
              onPress={handleSubmit}
              borderRadius={12}
            />
          </>
        )}
      </Formik>
      <View style={CommonStyles.bottomTextContainer}>
        <Text style={CommonStyles.bottomText}>{t('alreadyHaveAccount')} </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(AuthenticationStack.nestedScreens.signin.route)
          }>
          <Text style={{...CommonStyles.bottomTextBtn, color: Colors.Primary}}>
            {t('signin')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default EnterHOANumber;
