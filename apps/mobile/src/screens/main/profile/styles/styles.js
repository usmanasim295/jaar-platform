import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

export const styles = StyleSheet.create({
  container: {
    ...Layout.container,
    ...Layout.generalPaddingHorizontal,
    paddingTop: HEIGHT_BASE_RATIO(54),
  },
  sectionBox: {
    width: '100%',
    backgroundColor: Colors.White,
    // borderWidth: 0.1,
    borderColor: Colors.Grey,
    borderRadius: 12,
    padding: FONT_SIZE(16),
    elevation: 3,
    shadowColor: Colors.BlackText,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: HEIGHT_BASE_RATIO(16),
    gap: HEIGHT_BASE_RATIO(20),
  },
  sectionTitle: {
    ...Fonts.Jakarta_Sans_Bold_16_Black,
    marginBottom: HEIGHT_BASE_RATIO(4),
    // marginTop: 10,
  },
  itemIconAndTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(16),
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    // paddingVertical: 8,
  },
  itemLabel: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    // flex: 1,
    // left: 20,
  },
});
