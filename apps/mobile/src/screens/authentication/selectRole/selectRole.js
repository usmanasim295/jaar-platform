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
import {styles} from './styles/styles';
import {useNavigation} from '@react-navigation/native';
import {AuthenticationStack} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import {Building, Check, Leader} from '../../../assets/icons';
import {Fonts} from '../../../generalStyles/fontStyles';
import {useDispatch} from 'react-redux';
import {AuthSlice} from '../../../redux/slices/authSlice';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import {roles} from '../../../constants/roles';
import {useTranslation} from 'react-i18next';

const SelectRole = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const {t} = useTranslation();

  const [role, setRole] = useState(null);

  const onPressOption = option => {
    setRole(option);
    dispatch(AuthSlice.actions.setRole(option));
    const options = {
      enableVibrateFallback: true,
      ignoreAndroidSystemSettings: false,
    };
    ReactNativeHapticFeedback.trigger('impactLight', options);
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
      <Text style={CommonStyles.heading}>{t('signUp')}</Text>
      <Text style={CommonStyles.subText}>{t('pleaseSelectRoleType')}</Text>
      <View style={styles.optionContainer}>
        <TouchableOpacity
          style={[
            styles.optionStyle,
            {
              borderWidth: 2,
              borderColor: role == roles.leader ? Colors.Orange : Colors.White,
            },
          ]}
          onPress={() => onPressOption(roles.leader)}>
          <Leader />
          <Text style={styles.optionText}>{t('HOALeader')}</Text>
          {role == roles.leader && (
            <View style={styles.checkBox}>
              <Check />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.optionStyle,
            {
              borderWidth: 2,
              borderColor: role == roles.owner ? Colors.Orange : Colors.White,
            },
          ]}
          onPress={() => onPressOption(roles.owner)}>
          {role == roles.owner && (
            <View style={styles.checkBox}>
              <Check />
            </View>
          )}
          <Building />
          <Text style={styles.optionText}>{t('Homeowner')}</Text>
        </TouchableOpacity>
      </View>
      <CustomButton
        text={t('proceed')}
        backgroundColor={role ? Colors.Primary : Colors.LightGrey}
        textStyle={{
          ...CommonStyles.buttonText,
          color: role ? Colors.White : Colors.DarkGray,
        }}
        additionalCommonStyles={CommonStyles.button}
        width="100%"
        height={HEIGHT_BASE_RATIO(60)}
        marginTop={HEIGHT_BASE_RATIO(32)}
        borderColor={Colors.White}
        onPress={() =>
          role &&
          navigation.navigate(AuthenticationStack.nestedScreens.signUp.route)
        }
        borderRadius={12}
      />
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

export default SelectRole;
