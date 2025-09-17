import {
  View,
  Text,
  ImageBackground,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import React from 'react';
import {ApartmentBg} from '../../assets/images';
import {FONT_SIZE, HEIGHT_BASE_RATIO} from '../../utils/helpers';
import {Fonts} from '../../generalStyles/fontStyles';
import {ArrowRightWhite} from '../../assets/icons';

const Apartment = ({name, id, onPress, marginTop, showArrow}) => {
  return (
    <TouchableOpacity onPress={onPress} style={{marginTop: marginTop}}>
      <ImageBackground
        source={ApartmentBg}
        borderRadius={10}
        style={{
          padding: FONT_SIZE(16),
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        <View>
          <Text style={{...Fonts.Jakarta_Sans_SemiBold_14_White}}>{name}</Text>
          <Text
            style={{
              ...Fonts.Jakarta_Sans_Regular_12_White,
              marginTop: HEIGHT_BASE_RATIO(8),
            }}>
            {'ID:' + id}
          </Text>
        </View>
        {showArrow ? <ArrowRightWhite /> : <View />}
      </ImageBackground>
    </TouchableOpacity>
  );
};

export default Apartment;
