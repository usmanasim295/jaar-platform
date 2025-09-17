import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
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
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  AuthenticationStack,
  HomeStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import BottomSheet from '../../../components/bottomSheet/bottomSheet';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {AuthSlice} from '../../../redux/slices/authSlice';
import {SignupApi} from '../../../services/apis/auth/signup';

const PasswordSchema = Yup.object().shape({
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

const CreatePassword = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const {role} = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const {t} = useTranslation();

  // control bottom sheet
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const setToken = token => {
    dispatch(AuthSlice.actions.setToken(token));
  };
  const handleLoading = loading => {
    setLoading(loading);
  };
  const signup = async data => {
    const response = await SignupApi(handleLoading, data);
    if (response) {
      console.log('sign up response', response);
      setSheetVisible(true);
    }
  };
  const handleSubmit = (values: {
    password: string,
    confirmPassword: string,
  }) => {
    const formData = new FormData();
    formData.append('nationalId', params?.nationalId);
    formData.append('hoaNumber', params?.hoaNumber);
    formData.append('role', role);
    formData.append('document', {
      uri: params?.document?.uri,
      type: params?.document?.type,
      name: params?.document?.name,
    });
    formData.append('password', values.password);
    console.log('formdata', formData);
    signup(formData);
  };

  return (
    <>
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
        <Text style={CommonStyles.heading}>{t('createPassword')}</Text>
        <Text style={CommonStyles.subText}>{t('SecureYourAccount')}</Text>

        <Formik
          initialValues={{password: '', confirmPassword: ''}}
          validationSchema={PasswordSchema}
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
                    placeholder={t('password')}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureEntry={true}
                    error={touched.password && errors.password}
                  />
                  {touched.password && errors.password && (
                    <Text style={CommonStyles.errorText}>
                      {errors.password}
                    </Text>
                  )}
                </View>
                <View>
                  <CustomTextInput
                    placeholder={t('confirmPassword')}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureEntry={true}
                    error={touched.confirmPassword && errors.confirmPassword}
                  />
                  {touched.confirmPassword && errors.confirmPassword && (
                    <Text style={CommonStyles.errorText}>
                      {errors.confirmPassword}
                    </Text>
                  )}
                </View>
              </View>

              <CustomButton
                text={t('createPassword')}
                backgroundColor={Colors.Primary}
                textStyle={CommonStyles.buttonText}
                additionalCommonStyles={CommonStyles.button}
                width="100%"
                height={HEIGHT_BASE_RATIO(60)}
                borderColor={Colors.White}
                onPress={!loading && handleSubmit}
                borderRadius={12}
                marginTop={HEIGHT_BASE_RATIO(32)}
                load={loading}
              />
            </>
          )}
        </Formik>
        {!isSheetVisible && (
          <View style={CommonStyles.bottomTextContainer}>
            <Text style={CommonStyles.bottomText}>
              {t('alreadyHaveAccount')}{' '}
            </Text>
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  AuthenticationStack.nestedScreens.signin.route,
                )
              }>
              <Text
                style={{...CommonStyles.bottomTextBtn, color: Colors.Primary}}>
                {t('signin')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAwareScrollView>

      <BottomSheet
        isVisible={isSheetVisible}
        title={t('success')}
        message={t('accountCreatedSuccessfully')}
        buttonText="Next"
        onPressButton={() => {
          setSheetVisible(false);
          navigation.navigate(AuthenticationStack.nestedScreens.signin.route);
        }}
        onClose={() => setSheetVisible(false)}
      />
    </>
  );
};

export default CreatePassword;
