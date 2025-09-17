import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState} from 'react';
import {Layout} from '../../../generalStyles/layout';
import {JAR} from '../../../assets/svgs';
import CustomTextInput from '../../../components/textInput/textInput';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../../components/customButton/customButton';
import {Colors} from '../../../generalStyles/theme';
import {Formik} from 'formik';
import * as Yup from 'yup';
import {CommonStyles} from '../commonStyles/commonStyles';
import {useNavigation} from '@react-navigation/native';
import {
  AuthenticationStack,
  HomeStack,
  RootStackConfig,
} from '../../../constants/screenRoutes';
import {AuthSlice} from '../../../redux/slices/authSlice';
import {useDispatch} from 'react-redux';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';
import {LoginApi} from '../../../services/apis/auth/login';
import LangChanger from '../../../components/langChanger/langChanger';

const SigninSchema = Yup.object().shape({
  nationalId: Yup.string()
    .required('National ID is required')
    .min(5, 'National ID must be at least 5 characters'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

const Signin = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [loading, setLoading] = useState(false);

  const loginDispatch = (token, user) => {
    dispatch(AuthSlice.actions.login(user));
    dispatch(AuthSlice.actions.setToken(token));
    dispatch(AuthSlice.actions.setRole(user?.role));
    console.log('user', user);
  };
  const handleLoading = loading => {
    setLoading(loading);
  };
  const signin = async data => {
    const response = await LoginApi(handleLoading, null, data);
    if (response) {
      loginDispatch(response?.access_token, response?.user);
      navigation.navigate(RootStackConfig.nestedStacks.homeStack.route);
    }
  };
  const handleSubmit = (values: {nationalId: string, password: string}) => {
    console.log('Form Values:', values);
    signin(values);
  };

  return (
    <KeyboardAwareScrollView
      style={[Layout.container, Layout.generalPaddingHorizontal]}
      contentContainerStyle={{flexGrow: 1}}
      keyboardShouldPersistTaps="handled">
      <LangChanger />
      <JAR style={CommonStyles.jarLogo} />
      <Text style={CommonStyles.heading}>{t('signin')}</Text>
      <Text style={CommonStyles.subText}>{t('pleaseSignIntoYourAccount')}</Text>

      <Formik
        initialValues={{nationalId: '', password: ''}}
        validationSchema={SigninSchema}
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
                  placeholder={t('nationalIdNumber')}
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
                  <Text style={CommonStyles.errorText}>{errors?.password}</Text>
                )}
              </View>
            </View>

            <TouchableOpacity style={CommonStyles.forgotPasswordBtn}>
              <Text style={CommonStyles.forgotPassword}>
                {t('forgotPassword')}
              </Text>
            </TouchableOpacity>

            <CustomButton
              text={t('signin')}
              backgroundColor={Colors.Primary}
              textStyle={CommonStyles.buttonText}
              additionalCommonStyles={CommonStyles.button}
              width="100%"
              height={HEIGHT_BASE_RATIO(60)}
              borderColor={Colors.White}
              onPress={!loading && handleSubmit}
              borderRadius={12}
              load={loading}
            />
          </>
        )}
      </Formik>
      <View style={CommonStyles.bottomTextContainer}>
        <Text style={CommonStyles.bottomText}>{t('dontHaveAccount')} </Text>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate(
              AuthenticationStack.nestedScreens.selectRole.route,
            )
          }>
          <Text style={{...CommonStyles.bottomTextBtn, color: Colors.Primary}}>
            {t('signUp')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAwareScrollView>
  );
};

export default Signin;
