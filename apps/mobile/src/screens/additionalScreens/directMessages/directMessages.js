import {View, Text, Image, ScrollView, TouchableOpacity} from 'react-native';
import React from 'react';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {styles} from './styles/styles';
import {Chat} from '../../../assets/images';
import {Fonts} from '../../../generalStyles/fontStyles';
import {Colors} from '../../../generalStyles/theme';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';

const DirectMessages = () => {
  const dms = [
    {
      image: Chat,
      name: 'Connor Frazier',
      message: 'What kind of music do you like and what app do you use?',
      date: '09/18/16',
      messages: 16,
    },
    {
      image: Chat,
      name: 'Connor Frazier',
      message: 'What kind of music do you like and what app do you use?',
      date: '09/18/16',
      messages: 16,
    },
    {
      image: Chat,
      name: 'Connor Frazier',
      message: 'What kind of music do you like and what app do you use?',
      date: '09/18/16',
      messages: 16,
    },
  ];
  return (
    <>
      <NestedHeader screen={'Community Discussion'} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainerStyle}>
        {dms.map((item, index) => {
          return (
            <TouchableOpacity key={index} style={styles.chatContainer}>
              <Image source={item?.image} style={styles.chatImage} />
              <View style={styles.txtContainer}>
                <Text style={styles.nameTxt}>{item?.name}</Text>
                <Text style={styles.message}>{item?.message} </Text>
              </View>
              <View style={styles.dateAndNumberContainer}>
                <Text style={styles.date}>{item?.date}</Text>
                <View style={styles.messages}>
                  <Text style={styles.number}>{item?.messages}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </>
  );
};

export default DirectMessages;
