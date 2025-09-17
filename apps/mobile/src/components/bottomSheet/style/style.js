import {StyleSheet} from 'react-native';
import {HEIGHT_BASE_RATIO} from '../../../utils/helpers';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  container: {
    backgroundColor: Colors.White,
    padding: HEIGHT_BASE_RATIO(20),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    // alignItems: 'center',
  },
  title: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginTop: HEIGHT_BASE_RATIO(112),
    marginBottom: HEIGHT_BASE_RATIO(16),
    // textAlign: 'center',
  },
  message: {
    ...Fonts.Jakarta_Sans_Medium_14_Black,
    marginBottom: HEIGHT_BASE_RATIO(24),
  },
  button: {
    backgroundColor: Colors.Primary,
    paddingVertical: HEIGHT_BASE_RATIO(14),
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    ...Fonts.Jakarta_Sans_SemiBold_16_White,
  },
});
