import {StyleSheet} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';
const BG = Colors.White;
export const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: BG},
  scroll: {flex: 1},
  content: {
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    paddingTop: HEIGHT_BASE_RATIO(16),
    paddingBottom: HEIGHT_BASE_RATIO(120),
  },

  input: {
    borderWidth: 1,
    borderColor: Colors.Stroke,
    backgroundColor: Colors.White,
    borderRadius: 14,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    fontSize: 16,
    marginBottom: HEIGHT_BASE_RATIO(14),
    elevation: 1,
  },
  margin: {marginVertical: HEIGHT_BASE_RATIO(16)},
  marginTop: {marginTop: HEIGHT_BASE_RATIO(16)},
  textArea: {
    height: HEIGHT_BASE_RATIO(120),
    textAlignVertical: 'top',
  },
  checkStyle: {
    width: FONT_SIZE(20),
    height: FONT_SIZE(20),
    borderRadius: 4,
    backgroundColor: Colors.Orange,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: WIDTH_BASE_RATIO(12),
    top: HEIGHT_BASE_RATIO(12),
  },
  sectionTitle: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,
    marginTop: HEIGHT_BASE_RATIO(16),
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  durationBtn: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(60),
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Stroke,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WIDTH_BASE_RATIO(16),
  },
  card: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: Colors.White,
    borderWidth: 1,
    borderColor: Colors.Stroke,
    borderRadius: 12,
    paddingVertical: HEIGHT_BASE_RATIO(24),
    alignItems: 'center',
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  cardSelected: {
    borderColor: Colors.Red,
    borderWidth: 1,
  },
  cardIcon: {fontSize: 28, marginBottom: HEIGHT_BASE_RATIO(10)},
  cardLabel: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    textAlign: 'center',
  },

  inputWrap: {
    position: 'relative',
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  inputWithRightIcon: {paddingRight: WIDTH_BASE_RATIO(44)},
  rightIcon: {
    position: 'absolute',
    right: 16,
    top: '20%',
  },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingBottom: HEIGHT_BASE_RATIO(20),
    backgroundColor: BG,
  },
  nextBtn: {
    width: '100%',
    backgroundColor: Colors.Primary,
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: HEIGHT_BASE_RATIO(20),
  },
  nextText: {
    ...Fonts.Jakarta_Sans_SemiBold_16_White,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  dateBtn: {
    width: WIDTH_BASE_RATIO(191),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Stroke,
  },
  timeBtn: {
    width: '100%',
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.Stroke,
    marginTop: HEIGHT_BASE_RATIO(16),
  },
  titleValueGap: {gap: HEIGHT_BASE_RATIO(3)},
});
