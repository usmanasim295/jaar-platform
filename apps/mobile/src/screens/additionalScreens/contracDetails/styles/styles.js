import {StyleSheet} from 'react-native';
import {Fonts} from '../../../../generalStyles/fontStyles';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  rfqBadgeText: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  card: {
    width: '100%',
    // height: HEIGHT_BASE_RATIO(176),
    borderRadius: 14,
    marginTop: HEIGHT_BASE_RATIO(16),
    // flexDirection: 'row',
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(12),
    backgroundColor: Colors.White,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabs: {
    width: '100%',
    padding: FONT_SIZE(4),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.White,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderRadius: 10,
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  tabBtn: {
    width: '49%',
    height: HEIGHT_BASE_RATIO(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  requestBtn: {
    paddingHorizontal: WIDTH_BASE_RATIO(12),
    paddingVertical: HEIGHT_BASE_RATIO(10),
    backgroundColor: Colors.Primary,
    borderRadius: 8,
  },
  textContainer: {
    flexDirection: 'row',
  },
  name: {
    ...Fonts.Jakarta_Sans_Medium_12_Black,
  },
  role: {
    marginTop: HEIGHT_BASE_RATIO(2),
    ...Fonts.Jakarta_Sans_Regular_12_Grey,
  },
  description: {
    marginTop: HEIGHT_BASE_RATIO(8),
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  date: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    position: 'absolute',
    right: WIDTH_BASE_RATIO(16),
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  viewPosition: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    marginTop: HEIGHT_BASE_RATIO(24),
    // flex: 1,
  },
  medal: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: WIDTH_BASE_RATIO(87),
    height: HEIGHT_BASE_RATIO(36),
    marginRight: WIDTH_BASE_RATIO(10),
    backgroundColor: Colors.Stroke,
    borderRadius: 8,
  },
  medalIcon: {
    width: WIDTH_BASE_RATIO(18),
    height: HEIGHT_BASE_RATIO(18),
    resizeMode: 'contain',
    marginRight: WIDTH_BASE_RATIO(6),
  },
  medalText: {
    ...Fonts.Jakarta_Sans_Medium_12_Black,
  },
  star: {
    flexDirection: 'row',
    alignItems: 'center',
    width: WIDTH_BASE_RATIO(61),
    height: HEIGHT_BASE_RATIO(36),
    backgroundColor: Colors.Stroke,
    borderRadius: 8,
    paddingHorizontal: WIDTH_BASE_RATIO(8),
  },
  starIcon: {
    width: WIDTH_BASE_RATIO(16),
    height: HEIGHT_BASE_RATIO(16),
    resizeMode: 'contain',
    marginRight: WIDTH_BASE_RATIO(6),
  },
  starText: {
    ...Fonts.Jakarta_Sans_Medium_12_Black,
    color: Colors.Black,
  },
  moneyText: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Primary,
    // marginLeft: 'auto',
    // alignSelf: 'flex-end',
    // marginBottom: HEIGHT_BASE_RATIO(2),
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  bidText: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Primary,
    // marginLeft: 'auto',
    // alignSelf: 'flex-end',
    // marginBottom: HEIGHT_BASE_RATIO(2),
  },
  namedetail: {marginLeft: WIDTH_BASE_RATIO(10)},
  cancelBtn: {
    width: WIDTH_BASE_RATIO(43),
    height: HEIGHT_BASE_RATIO(35),
    backgroundColor: Colors.Red,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginRight: WIDTH_BASE_RATIO(8),
  },
  hireBtn: {
    width: WIDTH_BASE_RATIO(69),
    height: HEIGHT_BASE_RATIO(35),
    backgroundColor: Colors.Green,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  contentContainerPaddingBottom: {paddingBottom: HEIGHT_BASE_RATIO(10)},
  noBids: {
    alignSelf: 'center',
    marginTop: HEIGHT_BASE_RATIO(260),
    ...Fonts.Jakarta_Sans_Bold_18_Black,
  },
});

export default styles;
