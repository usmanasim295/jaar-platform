import {View, Text, TouchableOpacity, Alert} from 'react-native';
import React, {useState} from 'react';
import {Layout} from '../../../generalStyles/layout';
import {JAR} from '../../../assets/svgs';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../utils/helpers';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import CustomButton from '../../../components/customButton/customButton';
import {Colors} from '../../../generalStyles/theme';
import {CommonStyles} from '../commonStyles/commonStyles';
import {styles} from './styles/styles';
import {useNavigation, useRoute} from '@react-navigation/native';
import {AuthenticationStack} from '../../../constants/screenRoutes';
import BackButton from '../../../components/backButton/backButton';
import {File} from '../../../assets/icons';
import DocumentPicker from 'react-native-document-picker';
import {Fonts} from '../../../generalStyles/fontStyles';
import {useTranslation} from 'react-i18next';

const UploadDocuments = () => {
  const navigation = useNavigation();
  const {params} = useRoute();
  const {t} = useTranslation();

  const [selectedFile, setSelectedFile] = useState(null);

  const pickDocument = async () => {
    try {
      const res = await DocumentPicker.pickSingle({
        type: [
          DocumentPicker.types.pdf,
          DocumentPicker.types.doc,
          DocumentPicker.types.docx,
          DocumentPicker.types.images,
        ],
      });
      console.log('Selected File: ', res);
      setSelectedFile(res);
      Alert.alert('File Selected', res.name);
      // You can now upload this file to backend
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log('User cancelled the picker');
      } else {
        Alert.alert('Unknown Error: ', err);
        console.error('Unknown Error: ', err);
      }
    }
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
      <Text style={CommonStyles.heading}>{t('uploadDocument')}</Text>
      <Text style={CommonStyles.subText}>
        {t('pleaseUploadRequiredDocument')}
      </Text>

      <TouchableOpacity onPress={pickDocument} style={styles.uploadBtn}>
        <File />
        <Text style={styles.btnText}>{t('uploadDocument')}</Text>
      </TouchableOpacity>

      {selectedFile && (
        <View style={styles.selectedFileContainer}>
          <View style={styles.docPreviewIconAndRemoveContainer}>
            <File />
            <TouchableOpacity onPress={() => setSelectedFile(null)}>
              <Text
                style={{
                  ...Fonts.Jakarta_Sans_Regular_12_Red,
                }}>
                {t('remove')}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.selectedFileName}>{selectedFile?.name}</Text>
        </View>
      )}

      <CustomButton
        text={t('proceed')}
        backgroundColor={selectedFile ? Colors.Primary : Colors.Grey}
        textStyle={CommonStyles.buttonText}
        additionalCommonStyles={CommonStyles.button}
        width="100%"
        height={HEIGHT_BASE_RATIO(60)}
        marginTop={HEIGHT_BASE_RATIO(100)}
        borderColor={Colors.White}
        onPress={() =>
          selectedFile &&
          navigation.navigate(
            AuthenticationStack.nestedScreens.createPassword.route,
            {...params, document: selectedFile},
          )
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

export default UploadDocuments;
