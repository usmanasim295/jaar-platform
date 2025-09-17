import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import React from 'react';
import {ArrowBack} from '../../assets/icons';
import {FONT_SIZE} from '../../utils/helpers';
import {Colors} from '../../generalStyles/theme';
import {useNavigation} from '@react-navigation/native';

const BackButton = () => {
  const navigation = useNavigation();
  return (
    <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
      <ArrowBack />
    </TouchableOpacity>
  );
};

export default BackButton;

const styles = StyleSheet.create({
  button: {
    width: FONT_SIZE(50),
    height: FONT_SIZE(50),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.LightGrey,
    borderRadius: FONT_SIZE(25),
    position: 'absolute',
  },
});
