import React, {useRef, useState, useEffect} from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  Text,
  Animated,
  TouchableWithoutFeedback,
  Keyboard,
  Image,
  Pressable,
  ScrollView,
} from 'react-native';
import {styles} from '../communityDiscussion/styles/styles';
import NestedHeader from '../../../components/nestedHeader/nestedHeader';
import {
  Camera,
  FileArrow,
  Flag,
  Link,
  Location,
  Mic,
  Plus,
  ThumbsDown,
  ThumbsUp,
  Trash,
  UploadSimple,
} from '../../../assets/icons';
import {Colors} from '../../../generalStyles/theme';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {Layout} from '../../../generalStyles/layout';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../../utils/helpers';
import {Chat} from '../../../assets/images';
import {Fonts} from '../../../generalStyles/fontStyles';
import RBSheet from 'react-native-raw-bottom-sheet';
import CustomTextInput from '../../../components/textInput/textInput';

const chats = [
  {
    user: {id: 1, name: 'Alien', pfp: Chat},
    message:
      'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
    time: '08:30 AM',
    type: 'chat',
    image: Chat,
  },
  {
    user: {id: 2, name: 'Alien', pfp: Chat},
    message:
      'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
    time: '08:30 AM',
    type: 'chat',
    image: Chat,
  },
  {
    user: {id: 3, name: 'Alien', pfp: Chat},
    message:
      'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
    time: '08:30 AM',
    type: 'chat',
    image: Chat,
  },
  {
    user: {id: 3, name: 'Alien', pfp: Chat},
    message:
      'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
    time: '08:30 AM',
    type: 'chat',
    image: Chat,
  },
  {
    user: {id: 1, name: 'Alien', pfp: Chat},
    message:
      'pulvinar eleifend. In eu dolor tellus. Nam metus orci, eleifend at con eget',
    time: '08:30 AM',
    image: Chat,
  },
];
// const actions = [
//   {name: 'Poll', icon: <Flag />},
//   {name: 'Camera', icon: <Camera />},
//   {name: 'Location', icon: <Location />},
//   {name: 'Upload', icon: <FileArrow />},
// ];
export default function Announcements() {
  // const createPollSheetRef = useRef();
  // const userId = 3;
  // const actionsAnim = useRef(new Animated.Value(0)).current;

  // const [showActions, setShowActions] = useState(false);
  // const [keyboardHeight, setKeyboardHeight] = useState(0);
  // const [answers, setAnswers] = useState([
  //   {id: Date.now() + '_1', value: ''},
  //   {id: Date.now() + '_2', value: ''},
  // ]);

  // useEffect(() => {
  //   const keyboardShowListener = Keyboard.addListener('keyboardDidShow', e => {
  //     setKeyboardHeight(e.endCoordinates.height);
  //   });
  //   const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () => {
  //     setKeyboardHeight(0);
  //   });

  //   return () => {
  //     keyboardShowListener.remove();
  //     keyboardHideListener.remove();
  //   };
  // }, []);

  // const addAnswerField = () => {
  //   setAnswers(prev => [
  //     ...prev,
  //     {id: Date.now() + '_' + prev.length, value: ''},
  //   ]);
  // };
  // const removeAnswerField = id => {
  //   setAnswers(prev => prev.filter(answer => answer.id !== id));
  // };
  // const updateAnswerValue = (id, text) => {
  //   setAnswers(prev =>
  //     prev.map(answer =>
  //       answer.id === id ? {...answer, value: text} : answer,
  //     ),
  //   );
  // };
  const renderChatMessages = (item, index) => {
    return (
      <View style={styles.chatMsgContainerClient} key={index}>
        <Image source={Chat} style={styles.chatMsgPfp} />
        <View style={styles.chatMsgClient}>
          <Image
            source={item.image}
            style={[styles.pollImage, {height: HEIGHT_BASE_RATIO(124)}]}
          />

          <Text style={styles.messageClient}>{item?.message}</Text>
          <Text style={styles.date}>{item?.time}</Text>
        </View>
      </View>
    );
  };
  // const toggleActions = () => {
  //   const toValue = showActions ? 0 : 1;
  //   setShowActions(!showActions);
  //   Animated.spring(actionsAnim, {
  //     toValue,
  //     useNativeDriver: true,
  //     friction: 8,
  //     tension: 50,
  //   }).start();
  // };
  // const hideActions = () => {
  //   if (showActions) {
  //     setShowActions(false);
  //     Animated.spring(actionsAnim, {
  //       toValue: 0,
  //       useNativeDriver: true,
  //       friction: 8,
  //       tension: 50,
  //     }).start();
  //   }
  // };

  // const actionsTranslateY = actionsAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [150, 0], // slide from bottom
  // });

  // const actionsOpacity = actionsAnim.interpolate({
  //   inputRange: [0, 1],
  //   outputRange: [0, 1],
  // });

  return (
    <>
      <NestedHeader screen={'Announcements'} />
      <KeyboardAvoidingView
        style={Layout.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}>
        <KeyboardAwareScrollView
          style={{flex: 1}}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Pressable
            onPress={() => {
              Keyboard.dismiss();
            }}
            style={styles.chatsMessagesContainer}>
            {chats.map((item, index) => renderChatMessages(item, index))}
          </Pressable>
        </KeyboardAwareScrollView>

        {/* Bottom Input */}
        <View style={styles.bottomContainer}>
          <View style={styles.chatInputContainer}>
            <TextInput
              placeholder="Type your message..."
              style={styles.chatTextInput}
              multiline={true}
              placeholderTextColor={Colors.Grey}
            />
            <TouchableOpacity style={styles.linkButton}>
              <Link />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.voiceButton}>
            <Mic />
          </TouchableOpacity>
        </View>

        {/* Animated Actions */}
        {/* <Animated.View
          pointerEvents={showActions ? 'auto' : 'none'}
          style={[
            styles.actionsContainer,
            {
              transform: [{translateY: actionsTranslateY}],
              opacity: actionsOpacity,
              bottom:
                keyboardHeight > 0
                  ? keyboardHeight + HEIGHT_BASE_RATIO(40) // position above input & keyboard
                  : HEIGHT_BASE_RATIO(65), // default above input
            },
          ]}>
          {actions.map((item, index) => (
            <TouchableOpacity
              onPress={() => {
                item?.name == 'Poll' && createPollSheetRef?.current?.open();
                hideActions();
              }}
              key={index}
              style={styles.actionContainer}>
              <View style={styles.actionView}>{item.icon}</View>
              <Text style={styles.actionBtnTitle}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View> */}
      </KeyboardAvoidingView>

      {/* <RBSheet
        ref={createPollSheetRef}
        height={HEIGHT_BASE_RATIO(791)}
        openDuration={300}
        customStyles={{
          container: styles.bottomSheetRef,
        }}>
        <KeyboardAwareScrollView contentContainerStyle={styles.fieldsGap}>
          <Text style={styles.bottomSheetRefHeading}>Select Apartment</Text>
          <Text style={styles.optional}>Optional</Text>
          <TouchableOpacity style={styles.uploadImageBtn}>
            <UploadSimple />
            <Text style={styles.uploadImageTxt}>Upload Image</Text>
            <Text style={styles.supportedFormats}>supports: JPG, PNG, PDF</Text>
          </TouchableOpacity>
          <CustomTextInput placeholder={'Question'} />
          {answers.map((answer, index) => (
            <View key={answer.id} style={styles.answerFieldContainer}>
              <CustomTextInput
                placeholder={`Answer ${index + 1}`}
                additionalStyles={styles.answerField}
                value={answer.value}
                onChangeText={text => updateAnswerValue(answer.id, text)}
              />
              <TouchableOpacity
                style={styles.removerBtn}
                onPress={() => removeAnswerField(answer.id)}>
                <Trash />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            style={styles.addAnswerBtn}
            onPress={addAnswerField}>
            <Plus />
            <Text style={Fonts.Jakarta_Sans_Regular_14_Primary}>
              Add another answer
            </Text>
          </TouchableOpacity>

          <CustomTextInput placeholder={'1 h'} keyboardType={'numeric'} />
          <TouchableOpacity style={styles.createPollBtn}>
            <Text style={Fonts.Jakarta_Sans_SemiBold_16_White}>
              Create Poll
            </Text>
          </TouchableOpacity>
        </KeyboardAwareScrollView>
      </RBSheet> */}
    </>
  );
}
