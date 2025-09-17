import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {Colors} from '../../generalStyles/theme';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';
import {Fonts} from '../../generalStyles/fontStyles';
import {ArrowBack} from '../../assets/icons';
import {useNavigation} from '@react-navigation/native';

const NestedHeader = ({screen}) => {
  const navigation = useNavigation();

  return (
    <View style={styles.header}>
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}>
        <ArrowBack />
      </TouchableOpacity>

      {/* Center Title */}
      <Text style={styles.title}>{screen}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.White,
    borderBottomWidth: 1,
    borderBottomColor: Colors.Stroke,
    paddingVertical: HEIGHT_BASE_RATIO(18),
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    position: 'relative', // so absolute back button is placed relative to header
  },
  backButton: {
    position: 'absolute',
    left: WIDTH_BASE_RATIO(16),
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.Stroke,
    borderRadius: 20,
    zIndex: 99999,
  },
  title: {
    ...Fonts.Jakarta_Sans_SemiBold_18_Black,
    color: Colors.BlackText,
    textAlign: 'center',
    flex: 1,
  },
});

export default NestedHeader;
