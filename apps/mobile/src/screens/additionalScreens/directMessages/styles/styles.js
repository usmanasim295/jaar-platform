import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Fonts} from '../../../../generalStyles/fontStyles';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  container: {
    ...Layout.container,
  },
  contentContainerStyle: {
    ...Layout.generalPaddingHorizontal,
    paddingTop: HEIGHT_BASE_RATIO(26),
    rowGap: HEIGHT_BASE_RATIO(32),
  },
  chatContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(12),
  },
  chatImage: {
    width: FONT_SIZE(56),
    height: FONT_SIZE(56),
    borderRadius: FONT_SIZE(28),
  },
  txtContainer: {
    height: HEIGHT_BASE_RATIO(56),
    justifyContent: 'space-between',
  },
  dateAndNumberContainer: {
    height: HEIGHT_BASE_RATIO(56),
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    position: 'absolute',
    right: 0,
  },
  nameTxt: {...Fonts.Jakarta_Sans_SemiBold_16_Black},
  date: {...Fonts.Jakarta_Sans_Regular_12_Grey},
  messages: {
    width: FONT_SIZE(24),
    height: FONT_SIZE(24),
    borderRadius: 4,
    backgroundColor: Colors.Green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {...Fonts.Jakarta_Sans_SemiBold_12_White},
  message: {
    width: WIDTH_BASE_RATIO(211),
    ...Fonts.Jakarta_Sans_Regular_12_Grey,
  },
});
