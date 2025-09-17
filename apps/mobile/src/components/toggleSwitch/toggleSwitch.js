import React, {useEffect} from 'react';
import {Pressable, StyleSheet} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {Colors} from '../../generalStyles/theme';

export default function ToggleSwitch({isOn, onToggle}) {
  const offset = useSharedValue(isOn ? 1 : 0);

  // Update animation if parent changes isOn
  useEffect(() => {
    offset.value = withSpring(isOn ? 1 : 0, {damping: 15, stiffness: 150});
  }, [isOn]);

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: offset.value * 26,
      },
    ],
  }));

  const trackStyle = useAnimatedStyle(() => ({
    backgroundColor: isOn ? Colors.Green : Colors.LightGrey,
  }));

  return (
    <Pressable onPress={() => onToggle(!isOn)}>
      <Animated.View style={[styles.track, trackStyle]}>
        <Animated.View style={[styles.thumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 3,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
