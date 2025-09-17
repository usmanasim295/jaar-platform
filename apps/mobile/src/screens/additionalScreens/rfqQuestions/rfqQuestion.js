import React, {useState} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import CustomTextInput from '../../../components/textInput/textInput';
import {styles} from './styles/styles';
import BottomSheet from '../../../components/bottomSheet/bottomSheet';
import {useTranslation} from 'react-i18next';

const RfqQuestions = () => {
  const [isSheetVisible, setIsSheetVisible] = useState(false);
  const {t} = useTranslation();

  const handlePostJob = () => {
    setIsSheetVisible(true); // Show bottom sheet
  };
  const handleCloseSheet = () => {
    setIsSheetVisible(false); // Close bottom sheet
  };
  return (
    <View style={styles.screen}>
      <NestedHeader screen={t('rfqQuestions')} />
      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.content]}
        keyboardShouldPersistTaps="handled">
        <CustomTextInput
          placeholder={t('howManyElevators')}
          additionalStyles={styles.marginTop}
        />
        <CustomTextInput
          placeholder={t('howManyPools')}
          additionalStyles={styles.marginTop}
        />
        <CustomTextInput
          placeholder={t('howManyCleaningArea')}
          additionalStyles={styles.marginTop}
        />
      </KeyboardAwareScrollView>
      {!isSheetVisible && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.nextBtn} onPress={handlePostJob}>
            <Text style={styles.nextText}>{t('postJob')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <BottomSheet
        isVisible={isSheetVisible}
        title={t('jobPosted')}
        message={t('jobPostedMessage')}
        buttonText={t('close')}
        onPressButton={handleCloseSheet}
        onClose={handleCloseSheet}
      />
    </View>
  );
};

export default RfqQuestions;
