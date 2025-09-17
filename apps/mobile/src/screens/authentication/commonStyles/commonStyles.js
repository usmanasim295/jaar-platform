import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';
import {FontFamily} from '../../../generalStyles/generalFonts';

export const CommonStyles = StyleSheet.create({
  jarLogo: {alignSelf: 'center', marginTop: HEIGHT_BASE_RATIO(50)},
  heading: {
    ...Fonts.Avenir_Bold_24_Black,
    marginTop: HEIGHT_BASE_RATIO(77),
    marginBottom: HEIGHT_BASE_RATIO(12),
    alignSelf: 'center',
  },
  subText: {
    width: WIDTH_BASE_RATIO(319),
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    marginBottom: HEIGHT_BASE_RATIO(32),
    alignSelf: 'center',
    textAlign: 'center',
  },
  forgotPassword: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    color: Colors.Primary,
    marginBottom: HEIGHT_BASE_RATIO(24),
    marginRight: WIDTH_BASE_RATIO(16),
  },
  forgotPasswordBtn: {
    alignSelf: 'flex-end',
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  button: {borderRadius: 12},
  buttonText: {
    ...Fonts.Avenir_Demi_Bold_16_White,
  },
  errorText: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    color: Colors.Red,
    marginTop: HEIGHT_BASE_RATIO(2),
    marginLeft: WIDTH_BASE_RATIO(16),
  },
  bottomTextContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  bottomText: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
  },
  bottomTextBtn: {
    fontFamily: FontFamily.PlusJakartaSansMedium,
    fontSize: FONT_SIZE(14),
    color: Colors.Primary,
    // ...Fonts.Jakarta_Sans_Regular_14_Primary,
  },
});
