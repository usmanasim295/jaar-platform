import {StyleSheet} from 'react-native';
import {Fonts} from '../../../../generalStyles/fontStyles';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';

export const styles = StyleSheet.create({
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    //   justifyContent: 'center',
    paddingHorizontal: WIDTH_BASE_RATIO(20),
    width: '100%',
    height: HEIGHT_BASE_RATIO(60),
    backgroundColor: Colors.Stroke,
    borderRadius: 12,
  },
  btnText: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
    marginLeft: WIDTH_BASE_RATIO(20),
  },
  selectedFileContainer: {
    // flexDirection: 'row',
    // alignItems: 'center',
    width: WIDTH_BASE_RATIO(185),
    marginTop: HEIGHT_BASE_RATIO(16),
    padding: FONT_SIZE(12),
    backgroundColor: Colors.Stroke,
    borderRadius: 10,
    rowGap: HEIGHT_BASE_RATIO(20),
  },
  selectedFileName: {
    ...Fonts.Jakarta_Sans_Regular_14_Black,
  },
  docPreviewIconAndRemoveContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
