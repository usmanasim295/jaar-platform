import {View, Text, TouchableOpacity} from 'react-native';
import React, {useState, useCallback} from 'react';
import {Layout} from '../../../generalStyles/layout';
import {JAR} from '../../../assets/svgs';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../utils/helpers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Colors} from '../../../generalStyles/theme';
import {CommonStyles} from '../commonStyles/commonStyles';
import {
  useNavigation,
  useFocusEffect,
  useRoute,
} from '@react-navigation/native';
import {AuthenticationStack} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import CircularTimer from '../../../components/circularTimer/circularTimer';
import {styles} from './styles/styles';
import {useTranslation} from 'react-i18next';

const ApproveRequest = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const {t} = useTranslation();
  const [isTimerActive, setIsTimerActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setIsTimerActive(true); // Screen gained focus
      return () => {
        setIsTimerActive(false); // Screen lost focus
      };
    }, []),
  );

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
      <Text style={CommonStyles.heading}>{t('approveSignUpRequest')}</Text>
      <Text style={styles.subText}>{t('openYourAuthenticatorApp')}</Text>
      <CircularTimer
        duration={10}
        isActive={isTimerActive} // Controlled by screen focus
        onComplete={() =>
          navigation.navigate(
            AuthenticationStack.nestedScreens.enterHOANumber.route,
            params,
          )
        }
        code={89}
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

export default ApproveRequest;
