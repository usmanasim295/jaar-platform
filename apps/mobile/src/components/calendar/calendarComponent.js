import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, FlatList} from 'react-native';
import dayjs from 'dayjs';
import {Colors} from '../../generalStyles/theme';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../utils/helpers';
import {Fonts} from '../../generalStyles/fontStyles';
import {ArrowLeft, ArrowRight} from '../../assets/icons';

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CustomCalendar = ({
  onDateChange,
  initialDate,
  selectedDate: externallySelectedDate, // ISO 'YYYY-MM-DD'
  datesWithEvents = [],
}) => {
  // Store current month view as dayjs, default today or initialDate
  const [currentDate, setCurrentDate] = useState(() =>
    initialDate ? dayjs(initialDate) : dayjs(),
  );
  // Store selected date as ISO string (YYYY-MM-DD) or null
  const [selectedDate, setSelectedDate] = useState(() =>
    initialDate ? dayjs(initialDate).format('YYYY-MM-DD') : null,
  );

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const daysInMonth = endOfMonth.date();
  // Adjust so Monday = 0 ... Sunday = 6
  const startDayIndex = (startOfMonth.day() + 6) % 7;

  // Array of days to render, null for empty cells
  const dates = Array.from({length: startDayIndex + daysInMonth}, (_, i) =>
    i < startDayIndex ? null : i - startDayIndex + 1,
  );

  // Set of dates with events (formatted ISO date strings)
  const eventDatesSet = new Set(
    Array.isArray(datesWithEvents)
      ? datesWithEvents.map(d => dayjs(d).format('YYYY-MM-DD'))
      : [],
  );

  const handlePrev = () => setCurrentDate(prev => prev.subtract(1, 'month'));
  const handleNext = () => setCurrentDate(prev => prev.add(1, 'month'));

  const emitDateChange = day => {
    // Build selected date with full year and month info
    const selected = currentDate.date(day);
    const formatted = selected.format('YYYY-MM-DD'); // ISO format

    if (onDateChange) {
      onDateChange({
        day: selected.date(),
        month: selected.month() + 1,
        year: selected.year(),
        date: selected.toDate(),
        formatted, // <-- consistently ISO formatted date
      });
    }
  };

  const handleDatePress = day => {
    // Set selected date ISO string to state
    const fullDate = currentDate.date(day).format('YYYY-MM-DD');
    setSelectedDate(fullDate);
    emitDateChange(day);
  };

  // Update currentDate and selectedDate if externallySelectedDate changes
  useEffect(() => {
    if (externallySelectedDate) {
      const selectedDayJs = dayjs(externallySelectedDate);

      if (!selectedDayJs.isSame(currentDate, 'month')) {
        setCurrentDate(selectedDayJs);
      }
      const newSelectedDate = selectedDayJs.format('YYYY-MM-DD');
      if (selectedDate !== newSelectedDate) {
        setSelectedDate(newSelectedDate);
      }
    }
  }, [externallySelectedDate]);

  return (
    <View style={styles.calendarContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.monthBtn} onPress={handlePrev}>
          <ArrowLeft />
        </TouchableOpacity>
        <Text style={styles.monthText}>{currentDate.format('MMMM YYYY')}</Text>
        <TouchableOpacity style={styles.monthBtn} onPress={handleNext}>
          <ArrowRight />
        </TouchableOpacity>
      </View>

      {/* Week Days */}
      <View style={styles.weekDays}>
        {weekDays.map(day => (
          <Text key={day} style={styles.weekDayText}>
            {day}
          </Text>
        ))}
      </View>

      {/* Dates */}
      <FlatList
        data={dates}
        numColumns={7}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({item, index}) => {
          const isValidDate = item !== null;

          // Compose full ISO date for this day
          let fullDate = '';
          if (isValidDate) {
            fullDate = currentDate.date(item).format('YYYY-MM-DD');
          }

          const isSelected = isValidDate && selectedDate === fullDate;
          const hasEvent = isValidDate && eventDatesSet.has(fullDate);

          return (
            <TouchableOpacity
              style={[
                styles.dateCell,
                {
                  backgroundColor: isSelected ? Colors.Primary : Colors.White,
                  opacity: isValidDate ? 1 : 0,
                },
              ]}
              onPress={() => isValidDate && handleDatePress(item)}
              disabled={!isValidDate}
              key={index}>
              <Text
                style={[
                  styles.dateText,
                  isSelected && styles.selectedDateText,
                  !isValidDate && {color: 'transparent'},
                ]}>
                {item || ''}
              </Text>

              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: hasEvent
                    ? isSelected
                      ? Colors.White
                      : Colors.Primary
                    : 'transparent',
                  marginTop: 4,
                  alignSelf: 'center',
                }}
              />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
};

export default CustomCalendar;

const styles = StyleSheet.create({
  calendarContainer: {
    backgroundColor: Colors.White,
    borderRadius: 16,
    paddingHorizontal: WIDTH_BASE_RATIO(16),
    paddingVertical: HEIGHT_BASE_RATIO(16),
    width: WIDTH_BASE_RATIO(355),
    height: HEIGHT_BASE_RATIO(326),
    alignSelf: 'center',
    shadowColor: Colors.BlackText,
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  monthBtn: {
    width: WIDTH_BASE_RATIO(30),
    height: HEIGHT_BASE_RATIO(30),
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEIGHT_BASE_RATIO(12),
    height: HEIGHT_BASE_RATIO(24),
  },
  monthText: {
    ...Fonts.Jakarta_Sans_Bold_16_Black,
  },
  weekDays: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: HEIGHT_BASE_RATIO(41),
    width: WIDTH_BASE_RATIO(323),
  },
  weekDayText: {
    width: WIDTH_BASE_RATIO(46),
    textAlign: 'center',
    ...Fonts.Jakarta_Sans_Medium_12_Black,
  },
  dateCell: {
    width: WIDTH_BASE_RATIO(46),
    height: HEIGHT_BASE_RATIO(43),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  dateText: {
    ...Fonts.Jakarta_Sans_Bold_14_Primary,
  },
  selectedDateText: {
    color: Colors.White,
  },
});
