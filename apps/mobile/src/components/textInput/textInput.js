import {View, Text, TextInput, Pressable, Image} from 'react-native';
import React, {useState} from 'react';
import {Styles} from './styles/styles';
import {Colors} from '../../generalStyles/theme';
import {Mail, MapPin, MapPinGray} from '../../assets/icons';
import {
  ClosedEyeWhite,
  Closeeye,
  Openeye,
  OpeneyeWhite,
} from '../../assets/images';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';
import {FontFamily} from '../../generalStyles/generalFonts';
import {Fonts} from '../../generalStyles/fontStyles';

const CustomTextInput = ({
  keyboardType,
  placeholder,
  value,
  onChangeText,
  returnKeyType,
  returnKeyLabel,
  mode,
  onSubmitEditing,
  defaultValue,
  secureEntry,
  iconLeft,
  iconRight,
  isEye,
  onEnter,
  containerStyles,
  textInputStyles,
  placeholderTextAlign,
  placeholderTextColor,
  additionalStyles,
  editable,
  onPress,
  multiline,
  textAlignVertical,
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View
      style={[
        containerStyles ? containerStyles : Styles.inputContainer,
        additionalStyles,
      ]}>
      {iconLeft ? iconLeft : null}
      {editable === false ? (
        <Pressable
          style={[
            textInputStyles ? textInputStyles : Styles.input,
            {alignItems: 'center', justifyContent: 'center'},
          ]}
          onPress={onPress}>
          <Text
            style={[
              {
                ...Fonts.Poppins_Medium_16_Primary,

                color: placeholderTextColor
                  ? placeholderTextColor
                  : Colors.DarkGray,
              },
            ]}>
            {value || placeholder}
          </Text>
        </Pressable>
      ) : (
        <TextInput
          style={textInputStyles ? textInputStyles : Styles.input}
          secureTextEntry={secureEntry && !isPasswordVisible}
          placeholder={placeholder}
          multiline={multiline}
          placeholderTextColor={
            placeholderTextColor ? placeholderTextColor : Colors.DarkGray
          }
          editable={editable ? false : true}
          keyboardType={keyboardType ? keyboardType : 'default'}
          value={value}
          defaultValue={defaultValue}
          onChangeText={onChangeText}
          returnKeyType={returnKeyType ? returnKeyType : 'done'}
          inputMode={mode}
          returnKeyLabel={returnKeyLabel}
          onSubmitEditing={onSubmitEditing}
          autoCapitalize="none"
          onKeyPress={onEnter}
          onPress={onPress}
        />
      )}
      {iconRight}
      {isEye ? (
        <Pressable onPress={togglePasswordVisibility}>
          <Image
            resizeMode="contain"
            source={isPasswordVisible ? Openeye : Closeeye}
            style={Styles.eyeIcon}
          />
        </Pressable>
      ) : null}
    </View>
  );
};

export default CustomTextInput;
