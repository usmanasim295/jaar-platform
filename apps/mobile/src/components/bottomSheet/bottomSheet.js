import React, {useRef, useEffect} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {styles} from './style/style';
import {HEIGHT_BASE_RATIO} from '../../utils/helpers';

const BottomSheet = ({
  isVisible,
  title = 'Success!',
  message = 'Account has been created successfully.',
  buttonText = 'Back to Sign In',
  onPressButton,
  onClose,
}) => {
  const refRBSheet = useRef();
  useEffect(() => {
    if (isVisible) {
      refRBSheet.current?.open();
    } else {
      refRBSheet.current?.close();
    }
  }, [isVisible]);

  return (
    <RBSheet
      ref={refRBSheet}
      height={HEIGHT_BASE_RATIO(290)}
      closeOnDragDown={true}
      closeOnPressMask={true}
      onClose={onClose}
      customStyles={{
        wrapper: {
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        draggableIcon: {
          backgroundColor: '#ccc',
        },
        container: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          padding: 20,
          zIndex: 9999,
        },
      }}>
      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Message */}
      <Text style={styles.message}>{message}</Text>

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <Text style={styles.buttonText}>{buttonText}</Text>
      </TouchableOpacity>
    </RBSheet>
  );
};

export default BottomSheet;
