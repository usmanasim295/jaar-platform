import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import {Colors} from '../../generalStyles/theme';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';

const CustomButton = ({
  load,
  onPress,
  backgroundColor,
  text,
  width,
  loading,
  fontColor,
  borderColor,
  borderRadius,
  rightArrow,
  height,
  textStyle,
  marginTop,
  marginBottom,
  marginLeft,
  marginRight,
  shadowStyle,
  svgIcon,
  display,
  additionalStyles,
  borderWidth,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: backgroundColor,
          width: width ? width : WIDTH_BASE_RATIO(340),
          height: height ? height : HEIGHT_BASE_RATIO(56),
          borderWidth: borderWidth ? borderWidth : 1,
          borderColor: borderColor,
          borderRadius: borderRadius ? borderRadius : 30,
          flexDirection: 'row',
          marginTop: marginTop ? marginTop : 0,
          marginBottom: marginBottom ? marginBottom : 0,
          marginLeft: marginLeft ? marginLeft : 0,
          marginRight: marginRight ? marginRight : 0,
          display: display ? display : 'flex',
          ...shadowStyle,
          ...additionalStyles,
        },
      ]}
      onPress={onPress}>
      <Text style={[textStyle]}>
        {load ? <ActivityIndicator color={'#ffffff'} /> : text}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;

const styles = StyleSheet.create({
  container: {
    marginBottom: HEIGHT_BASE_RATIO(8),
    height: HEIGHT_BASE_RATIO(56),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: Colors.White,
  },
});
