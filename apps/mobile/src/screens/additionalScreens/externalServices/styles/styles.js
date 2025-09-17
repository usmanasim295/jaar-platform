import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  rowServicesCard: {
    width: WIDTH_BASE_RATIO(191),
    height: HEIGHT_BASE_RATIO(130),
    backgroundColor: Colors.White,
    borderRadius: 12,
    padding: FONT_SIZE(16),
    justifyContent: 'space-between',
    backgroundColor: Colors.White,
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 2,
  },
  serviceCard: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(102),
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(24),
    // justifyContent: 'space-between',
    backgroundColor: Colors.White,
    borderRadius: 12,
    padding: FONT_SIZE(16),
    backgroundColor: Colors.White,
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 2,
    marginTop: HEIGHT_BASE_RATIO(36),
  },
  rowServiceCardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  icon: {width: FONT_SIZE(50), height: FONT_SIZE(50)},
});
