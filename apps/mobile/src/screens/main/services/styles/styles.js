import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

export const styles = StyleSheet.create({
  containerPadding: {paddingBottom: HEIGHT_BASE_RATIO(88) + 20},
  tabContainer: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(46),
    borderRadius: 10,
    padding: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.White,
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 2,
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  tab: {
    width: '49%',
    height: HEIGHT_BASE_RATIO(40),
    borderRadius: 10,
    backgroundColor: Colors.Greyish,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceCard: {
    width: '100%',
    padding: FONT_SIZE(16),
    backgroundColor: Colors.White,
    borderRadius: 12,
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.07,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 4,
    elevation: 2,
  },
  timeAndDate: {
    paddingHorizontal: WIDTH_BASE_RATIO(8),
    paddingVertical: HEIGHT_BASE_RATIO(12),
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.Stroke,
  },
  timeAndDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: WIDTH_BASE_RATIO(8),
  },
  statusContainer: {flexDirection: 'row', alignItems: 'center'},
  dateTimeAndStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(8),
  },
  description: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    marginVertical: HEIGHT_BASE_RATIO(16),
  },
  serviceTopContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  services: {
    marginTop: HEIGHT_BASE_RATIO(8),
    paddingTop: HEIGHT_BASE_RATIO(8),
    paddingHorizontal: WIDTH_BASE_RATIO(6),
    rowGap: HEIGHT_BASE_RATIO(16),
  },
  postJobBtn: {
    paddingHorizontal: WIDTH_BASE_RATIO(17.5),
    paddingVertical: HEIGHT_BASE_RATIO(10),
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Green,
  },
});
