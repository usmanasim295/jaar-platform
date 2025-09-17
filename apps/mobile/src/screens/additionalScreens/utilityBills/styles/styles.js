import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

export const styles = StyleSheet.create({
  container: {...Layout.container, ...Layout.generalPaddingHorizontal},
  billsContainer: {
    marginTop: HEIGHT_BASE_RATIO(16),
    paddingTop: HEIGHT_BASE_RATIO(8),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  card: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(122),
    backgroundColor: Colors.White,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  cardText: {
    marginTop: HEIGHT_BASE_RATIO(16),
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  header: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,

    justifyContent: 'flex-start',
  },
  viewAll: {
    ...Fonts.Jakarta_Sans_SemiBold_12_Primary,
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    width: WIDTH_BASE_RATIO(398),
    height: HEIGHT_BASE_RATIO(72),
    borderRadius: 12,
    padding: 12,
    marginBottom: HEIGHT_BASE_RATIO(16),
    // iOS Shadow
    shadowColor: Colors.Grey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,

    // Android Shadow
    elevation: 3,
  },
  billIcon: {
    backgroundColor: '#f0f0f0',
    borderRadius: 50,
    padding: 0,
    marginRight: 12,
  },
  billText: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    flex: 1,
  },
  billPrice: {
    ...Fonts.Jakarta_Sans_Bold_14_Primary,
  },
});
