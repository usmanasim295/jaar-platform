import {WIDTH_BASE_RATIO, HEIGHT_BASE_RATIO, FONT_SIZE} from '../utils/helpers';
import {Colors} from './theme';
const {StyleSheet} = require('react-native');

export const Layout = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Colors.White,
  },
  authWrapperContainer: {flex: 1, backgroundColor: 'white'},
  generalPaddingHorizontal: {
    // marginTop: HEIGHT_BASE_RATIO(10),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
  },
  langButton: {
    width: WIDTH_BASE_RATIO(60),
    height: HEIGHT_BASE_RATIO(40),
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
});
