import React, {forwardRef, useState} from 'react';
import {View, Text, TouchableOpacity, FlatList, StyleSheet} from 'react-native';
import RBSheet from 'react-native-raw-bottom-sheet';
import {Fonts} from '../../generalStyles/fontStyles';
import {Colors} from '../../generalStyles/theme';
import {HEIGHT_BASE_RATIO, WIDTH_BASE_RATIO} from '../../utils/helpers';

const PaymentBottomSheet = forwardRef(
  ({methods = [], onSelect, onAddPress}, ref) => {
    const [selected, setSelected] = useState(null);

    const handleSelect = item => {
      setSelected(item.id);
      if (onSelect) onSelect(item);
    };

    const renderOption = item => (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.optionBox,
          selected === item.id && styles.optionBoxSelected,
        ]}
        onPress={() => handleSelect(item)}
        activeOpacity={0.8}>
        <View style={styles.row}>
          {/* Radio */}
          <View style={styles.radioCircle}>
            {selected === item.id && <View style={styles.selectedCircle} />}
          </View>

          {/* Icon */}
          <View style={styles.iconWrapper}>{item.icon}</View>

          {/* Label + Card Data */}
          <View style={styles.labelRow}>
            {item.label && <Text style={styles.label}>{item.label}</Text>}
            {item.data && <Text style={styles.cardData}>{item.data}</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );

    const renderItem = ({item}) => {
      if (item.type === 'row') {
        return (
          <View style={styles.rowGroup}>
            {item.items.map(subItem => renderOption(subItem))}
          </View>
        );
      }
      return renderOption(item);
    };

    return (
      <RBSheet
        ref={ref}
        height={HEIGHT_BASE_RATIO(347)}
        openDuration={250}
        customStyles={{
          container: styles.sheetContainer,
        }}>
        <Text style={styles.title}>Payment Method</Text>

        <FlatList
          data={methods}
          renderItem={renderItem}
          keyExtractor={item => item.id || Math.random().toString()}
          showsVerticalScrollIndicator={false}
        />

        <TouchableOpacity style={styles.addButton} onPress={onAddPress}>
          <Text style={styles.addButtonText}>Add Payment Method</Text>
        </TouchableOpacity>
      </RBSheet>
    );
  },
);

const styles = StyleSheet.create({
  sheetContainer: {
    height: HEIGHT_BASE_RATIO(347),
    borderTopLeftRadius: WIDTH_BASE_RATIO(20),
    borderTopRightRadius: WIDTH_BASE_RATIO(20),
    padding: WIDTH_BASE_RATIO(16),
  },
  title: {
    ...Fonts.Jakarta_Sans_Bold_18_Black,
    marginTop: HEIGHT_BASE_RATIO(40),
    marginBottom: HEIGHT_BASE_RATIO(12),
  },
  optionBox: {
    flex: 1,
    borderWidth: WIDTH_BASE_RATIO(2),
    borderColor: Colors.Stroke,
    borderRadius: WIDTH_BASE_RATIO(12),
    padding: HEIGHT_BASE_RATIO(14),
    marginBottom: HEIGHT_BASE_RATIO(16),
    marginHorizontal: WIDTH_BASE_RATIO(4),
  },
  optionBoxSelected: {
    borderColor: Colors.Brown,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioCircle: {
    height: WIDTH_BASE_RATIO(20),
    width: WIDTH_BASE_RATIO(20),
    borderRadius: WIDTH_BASE_RATIO(10),
    borderWidth: WIDTH_BASE_RATIO(2),
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: WIDTH_BASE_RATIO(12),
  },
  selectedCircle: {
    width: WIDTH_BASE_RATIO(10),
    height: WIDTH_BASE_RATIO(10),
    borderRadius: WIDTH_BASE_RATIO(5),
    backgroundColor: Colors.Brown,
  },
  iconWrapper: {
    marginRight: WIDTH_BASE_RATIO(8),
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: WIDTH_BASE_RATIO(4),
  },
  label: {
    ...Fonts.Avenir_Medium_16_Black,
  },
  cardData: {
    marginLeft: WIDTH_BASE_RATIO(16),
    ...Fonts.Avenir_Regular_14_Grey,
  },
  rowGroup: {
    flexDirection: 'row',
    marginTop: HEIGHT_BASE_RATIO(16),
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

export default PaymentBottomSheet;
