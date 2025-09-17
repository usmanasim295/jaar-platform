import {StyleSheet} from 'react-native';
import {Dimensions} from 'react-native';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';

const {width} = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(102),
    backgroundColor: Colors.Primary, // base blue background
    borderRadius: 20,
    overflow: 'hidden', // ensures bubbles don't spill out
    // margin: 20,
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  bottomSheetRef: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(40),
  },
  bottomSheetRefHeading: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,
  },
  searchTextInput: {
    marginLeft: WIDTH_BASE_RATIO(10),
    width: '90%',
    height: '100%',
  },
  searchTextInputContainer: {
    borderRadius: FONT_SIZE(30),
    backgroundColor: Colors.Stroke,
    marginTop: HEIGHT_BASE_RATIO(24),
    padding: 0,
  },
  bottomSheetSubHeading: {
    ...Fonts.Jakarta_Sans_SemiBold_16_Black,
  },
  bottomSheetSubHeadingMarginTop: {
    marginTop: HEIGHT_BASE_RATIO(8),
  },
  bubble: {
    position: 'absolute',
    backgroundColor: '#2E6C84',
    opacity: 0.6,
    borderRadius: 100,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: {width: 0, height: 4},
  },
  bubbleLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  bubbleMedium: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  bubbleSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  serviceCardInnerContainer: {justifyContent: 'center'},
  serviceCardTitleContainer: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    gap: WIDTH_BASE_RATIO(24),
    marginLeft: WIDTH_BASE_RATIO(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: WIDTH_BASE_RATIO(16),
    marginTop: HEIGHT_BASE_RATIO(24),
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
  cardSelected: {
    borderColor: Colors.Red,
    borderWidth: 1,
  },
  cardIcon: {fontSize: 28, marginBottom: HEIGHT_BASE_RATIO(10)},
  cardLabel: {
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    textAlign: 'center',
  },
  dateBox: {
    width: WIDTH_BASE_RATIO(72),
    height: HEIGHT_BASE_RATIO(81),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.Stroke,
    alignItems: 'center',
    justifyContent: 'center',
    gap: HEIGHT_BASE_RATIO(8),
  },
  requestServiceGap: {gap: HEIGHT_BASE_RATIO(16)},
  dateBoxGap: {columnGap: WIDTH_BASE_RATIO(12)},
  timeBox: {
    paddingHorizontal: WIDTH_BASE_RATIO(24),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    borderRadius: 30,
    borderWidth: 1,
    borderColor: Colors.Stroke,
  },
  timeText: {
    ...Fonts.Jakarta_Sans_Medium_14_Black,
  },
  bottomSheetBtn: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(60),
    borderRadius: 12,
    backgroundColor: Colors.Primary,
    borderColor: Colors.Primary,
    marginTop: HEIGHT_BASE_RATIO(8),
  },
});
