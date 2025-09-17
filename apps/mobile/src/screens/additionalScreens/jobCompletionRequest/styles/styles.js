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
  container: {...Layout.container, ...Layout.generalPaddingHorizontal},
  tab: {
    borderRadius: 12,
    backgroundColor: Colors.White,
    padding: HEIGHT_BASE_RATIO(12),
    marginTop: HEIGHT_BASE_RATIO(12),
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
  },
  title: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginBottom: HEIGHT_BASE_RATIO(8),
  },
  subtitle: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    marginBottom: HEIGHT_BASE_RATIO(10),
  },
  time: {
    ...Fonts.Jakarta_Sans_Regular_12_Grey,
  },
  proposal: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Primary,
  },
  viewPosition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
