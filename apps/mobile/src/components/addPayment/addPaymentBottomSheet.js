import React, {forwardRef} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Fonts} from '../../generalStyles/fontStyles';
import {Colors} from '../../generalStyles/theme';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';

const AddPaymentBottomSheet = forwardRef(({onAdd}, ref) => {
  return (
    <RBSheet
      ref={ref}
      height={HEIGHT_BASE_RATIO(400)}
      openDuration={250}
      customStyles={{
        container: styles.sheetContainer,
      }}>
      <Text style={styles.title}>Add Payment Method</Text>

      {/* Name on Card */}
      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>Name On Card</Text>
        <TextInput style={styles.input} placeholder="John Doe" />
      </View>

      {/* Card Number */}
      <View style={styles.inputBox}>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput
          style={styles.input}
          placeholder="XXXX XXXX XXXX 1234"
          keyboardType="number-pad"
        />
      </View>

      {/* Expiry + CVV */}
      <View style={styles.row}>
        <View style={[styles.inputBox, {flex: 1, marginRight: 8}]}>
          <Text style={styles.inputLabel}>Expiry</Text>
          <TextInput style={styles.input} placeholder="MM/YY" />
        </View>
        <View style={[styles.inputBox, {flex: 1, marginLeft: 8}]}>
          <Text style={styles.inputLabel}>CVV</Text>
          <TextInput style={styles.input} placeholder="123" secureTextEntry />
        </View>
      </View>

      {/* Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addButtonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </RBSheet>
  );
});

const styles = StyleSheet.create({
  sheetContainer: {
    borderTopLeftRadius: WIDTH_BASE_RATIO(20),
    borderTopRightRadius: WIDTH_BASE_RATIO(20),
    padding: WIDTH_BASE_RATIO(16),
  },
  title: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginBottom: HEIGHT_BASE_RATIO(20),
  },
  inputBox: {
    marginBottom: HEIGHT_BASE_RATIO(16),
  },
  inputLabel: {
    ...Fonts.Avenir_Regular_14_Grey,
    marginBottom: HEIGHT_BASE_RATIO(4),
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.Stroke,
    borderRadius: WIDTH_BASE_RATIO(12),
    padding: HEIGHT_BASE_RATIO(12),
    fontSize: WIDTH_BASE_RATIO(14),
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addButton: {
    marginTop: HEIGHT_BASE_RATIO(20),
    backgroundColor: Colors.Primary,
    padding: HEIGHT_BASE_RATIO(14),
    borderRadius: WIDTH_BASE_RATIO(12),
    alignItems: 'center',
  },
  addButtonText: {
    ...Fonts.Avenir_Demi_Bold_16_White,
  },
});

export default AddPaymentBottomSheet;
