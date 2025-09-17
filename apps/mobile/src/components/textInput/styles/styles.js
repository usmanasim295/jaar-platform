import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Colors} from '../../../generalStyles/theme';
import {FontFamily} from '../../../generalStyles/generalFonts';

export const Styles = StyleSheet.create({
  inputContainer: {
    height: HEIGHT_BASE_RATIO(60),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: Colors.Stroke,
    borderWidth: 2,
    borderRadius: 8,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
  },
  input: {
    flex: 1,
    height: HEIGHT_BASE_RATIO(62),
    fontFamily: FontFamily.PlusJakartaSanRegular,
    fontSize: FONT_SIZE(14),
    color: Colors.Grey,
    // marginLeft: WIDTH_BASE_RATIO(10),
    textAlignVertical: 'center',
    padding: 0,
  },
  buttonText: {
    flex: 1,
    height: HEIGHT_BASE_RATIO(58),
    fontFamily: FontFamily.PlusJakartaSanRegular,
    fontSize: FONT_SIZE(16),
    color: Colors.Grey,
    marginLeft: WIDTH_BASE_RATIO(5),
    paddingTop: HEIGHT_BASE_RATIO(7),
  },
  eyeIcon: {
    width: WIDTH_BASE_RATIO(27),
    height: HEIGHT_BASE_RATIO(27),
  },
});
