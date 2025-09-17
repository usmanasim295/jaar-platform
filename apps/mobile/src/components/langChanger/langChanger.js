import {View, Text, TouchableOpacity} from 'react-native';
import React, {useRef, useState} from 'react';
import i18next from '../../../services/i18next';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import {AuthSlice} from '../../redux/slices/authSlice';
import {Layout} from '../../generalStyles/layout';
import {Fonts} from '../../generalStyles/fontStyles';
import {Colors} from '../../generalStyles/theme';

const LangChanger = () => {
  const {t} = useTranslation();
  const dispatch = useDispatch();
  const changeLanguage = lng => {
    i18next.changeLanguage(lng);
    dispatch(AuthSlice.actions.setLanguage(lng));
  };
  const state = useSelector(state => state.auth);
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        position: 'absolute',
      }}>
      <TouchableOpacity
        onPress={() => {
          changeLanguage('en');
        }}
        style={{
          ...Layout.langButton,
          backgroundColor:
            i18next.language == 'en'
              ? Colors.Primary
              : state.darkTheme
              ? Colors.DarkGray
              : Colors.White,
        }}>
        <Text
          style={{
            ...Fonts.Jakarta_Sans_Bold_14_Primary,
            color:
              i18next.language == 'en'
                ? Colors.White
                : state.darkTheme
                ? Colors.White
                : Colors.DarkGray,
          }}>
          English
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => {
          changeLanguage('ar');
        }}
        style={{
          ...Layout.langButton,
          backgroundColor:
            i18next.language == 'ar'
              ? Colors.Primary
              : state.darkTheme
              ? Colors.DarkGray
              : Colors.White,
        }}>
        <Text
          style={{
            ...Fonts.Jakarta_Sans_Bold_14_Primary,
            color:
              i18next.language == 'ar'
                ? Colors.White
                : state.darkTheme
                ? Colors.White
                : Colors.DarkGray,
          }}>
          Arabic
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default LangChanger;
