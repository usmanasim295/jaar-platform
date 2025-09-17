import {StyleSheet} from 'react-native';
import {CommonStyles} from '../../commonStyles/commonStyles';
import {HEIGHT_BASE_RATIO} from '../../../../utils/helpers';

export const styles = StyleSheet.create({
  subText: {...CommonStyles.subText, marginBottom: HEIGHT_BASE_RATIO(24)},
});
