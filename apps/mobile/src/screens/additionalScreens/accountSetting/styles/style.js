import {StyleSheet} from 'react-native';
import {Layout} from '../../../../generalStyles/layout';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../../../utils/helpers';
import {Colors} from '../../../../generalStyles/theme';
import {Fonts} from '../../../../generalStyles/fontStyles';
export const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: Colors.White,
  },
  container: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionBox: {
    width: WIDTH_BASE_RATIO(398),
    backgroundColor: Colors.White,
    // borderWidth: 0.1,
    borderColor: Colors.Grey,
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    elevation: 3,
  },
  sectionTitle: {
    ...Fonts.Jakarta_Sans_Bold_16_Black,
    marginBottom: 8,
    marginTop: 10,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  itemLabel: {
    flex: 1,
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
    left: 20,
  },
});
