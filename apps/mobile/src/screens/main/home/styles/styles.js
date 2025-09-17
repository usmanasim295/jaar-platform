import {StyleSheet} from 'react-native';
import {Fonts} from '../../../../generalStyles/fontStyles';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  name: {
    ...Fonts.Jakarta_Sans_SemiBold_24_Black,
    marginTop: HEIGHT_BASE_RATIO(24),
  },
  subText: {
    ...Fonts.Jakarta_Sans_Regular_14_Grey,
    marginTop: HEIGHT_BASE_RATIO(10),
  },
  heading: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,
    marginTop: HEIGHT_BASE_RATIO(24),
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  bottomSheetRefHeading: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,
    marginBottom: HEIGHT_BASE_RATIO(8),
  },
  bottomSheetRef: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(40),
  },
  container: {
    paddingVertical: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flexGridContainer: {
    position: 'relative',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: HEIGHT_BASE_RATIO(16),
    // columnGap: WIDTH_BASE_RATIO(16),
  },
  card: {
    position: 'absolute',
    width: WIDTH_BASE_RATIO(191), // Adjusted for wrapping
    backgroundColor: Colors.White,
    borderRadius: 16,
    padding: 16,
    shadowColor: Colors.BlackText,
    shadowOpacity: 0.05,
    shadowOffset: {width: 0, height: 4},
    shadowRadius: 6,
    elevation: 2,
    marginBottom: HEIGHT_BASE_RATIO(8), // optional safety spacing
  },

  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: HEIGHT_BASE_RATIO(30),
    borderRadius: 40,
    backgroundColor: Colors.FoundationBlue,
  },
  label: {
    ...Fonts.Jakarta_Sans_SemiBold_14_White,
    color: Colors.BlackText,
  },
  createRfqBtn: {
    width: WIDTH_BASE_RATIO(81),
    height: HEIGHT_BASE_RATIO(24),
    borderRadius: 5,
    backgroundColor: Colors.Orange,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    right: WIDTH_BASE_RATIO(16),
    top: HEIGHT_BASE_RATIO(16),
  },
});
