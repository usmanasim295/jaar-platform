import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

export const styles = StyleSheet.create({
  optionStyle: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(178),
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.White,
    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 8,
    // Android Shadow
    elevation: 3,
  },
  optionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    ...Fonts.Jakarta_Sans_Medium_16_Black,
    marginTop: HEIGHT_BASE_RATIO(20),
  },
  checkBox: {
    width: FONT_SIZE(20),
    height: FONT_SIZE(20),
    borderRadius: 4,
    backgroundColor: Colors.Orange,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: FONT_SIZE(12),
    top: FONT_SIZE(12),
  },
});
