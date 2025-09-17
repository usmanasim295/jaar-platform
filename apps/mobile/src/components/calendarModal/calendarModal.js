// components/calendarModal/CalendarModal.js
import React from 'react';
import {View, Text, TouchableOpacity, Modal, StyleSheet} from 'react-native';
import moment from 'moment';
import CustomCalendar from '../calendar/calendarComponent';
import {Colors} from '../../generalStyles/theme';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../utils/helpers';
import {Fonts} from '../../generalStyles/fontStyles';

export default function CalendarModal({visible, onClose, onSelectDate, title}) {
  const handleDateChange = dateObj => {
    const formatted = moment(dateObj?.date || new Date()).format('YYYY-MM-DD');
    onSelectDate(formatted);
    onClose(); // close after picking
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title || 'Pick a Date'}</Text>
          <CustomCalendar onDateChange={handleDateChange} />

          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: Colors.White,
    padding: WIDTH_BASE_RATIO(20),
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  closeButton: {
    marginTop: HEIGHT_BASE_RATIO(20),
    padding: FONT_SIZE(18),
    backgroundColor: 'rgba(255, 0, 0, 0.08)',
    // borderColor: Colors.White,
    // borderWidth: 1.5,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    ...Fonts.Jakarta_Sans_SemiBold_14_White,
    color: Colors.Red,
  },
});
