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
import {useNavigation} from '@react-navigation/native';
import {AuthenticationStack} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';

const SignupSchema = Yup.object().shape({
  nationalId: Yup.string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),
});
const Signup = () => {
  const navigation = useNavigation();
  const {role} = useSelector(state => state.auth);
  const {t} = useTranslation();

  const handleSubmit = (values: {nationalId: string, password: string}) => {
    navigation.navigate(
      AuthenticationStack.nestedScreens.approveRequest.route,
      {nationalId: values.nationalId},
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
      <Text style={CommonStyles.heading}>{t('governmentId')}</Text>
      <Text style={CommonStyles.subText}>{t('enterNumberBelow')}</Text>

      <Formik
        initialValues={{nationalId: '', password: ''}}
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
                  placeholder={t('enterGovernmentId')}
                  value={values.nationalId}
                  onChangeText={handleChange('nationalId')}
                  onBlur={handleBlur('nationalId')}
                  error={touched.nationalId && errors.nationalId}
                />
                {touched.nationalId && errors.nationalId && (
                  <Text style={CommonStyles.errorText}>
                    {errors?.nationalId}
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
        <Text style={CommonStyles.bottomText}>{t('alreadyHaveAccount')}</Text>
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

export default Signup;
