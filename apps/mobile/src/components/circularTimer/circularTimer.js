import React, {useEffect, useState} from 'react';
import {Text, StyleSheet, View} from 'react-native';
import {AnimatedCircularProgress} from 'react-native-circular-progress';
import {Colors} from '../../generalStyles/theme';
import {Fonts} from '../../generalStyles/fontStyles';
import {HEIGHT_BASE_RATIO} from '../../utils/helpers';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const CircularTimer = ({
  duration = 30,
  size = 120,
  width = 4,
  onComplete = () => {},
  code,
  isActive = true, // NEW PROP to control start/stop
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (!isActive) return; // If screen is not focused, don't run timer.

    if (timeLeft === 0) {
      onComplete();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const newTimeLeft = prev - 1;

        // Haptic Feedback
        const options = {
          enableVibrateFallback: true,
          ignoreAndroidSystemSettings: false,
        };

        if (newTimeLeft > 10) {
          ReactNativeHapticFeedback.trigger('impactLight', options);
        } else {
          ReactNativeHapticFeedback.trigger('impactHeavy', options);
        }

        return newTimeLeft;
      });

      setProgress(prevProgress => prevProgress - 100 / duration);
    }, 1000);

    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  return (
    <View style={styles.container}>
      <AnimatedCircularProgress
        size={size}
        width={width}
        fill={progress}
        tintColor={timeLeft <= 10 ? Colors.Red : Colors.Green}
        backgroundColor={Colors.White}
        rotation={0}
        lineCap="round">
        {() => <Text style={styles.codeText}>{code}</Text>}
      </AnimatedCircularProgress>
      <Text style={styles.timerText}>
        {Math.floor(timeLeft / 60)
          .toString()
          .padStart(2, '0')}
        :
        {Math.floor(timeLeft % 60)
          .toString()
          .padStart(2, '0')}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {alignItems: 'center', justifyContent: 'center'},
  codeText: {...Fonts.Jakarta_Sans_Bold_32_Black},
  timerText: {
    ...Fonts.Jakarta_Sans_Regular_16_Primary,
    marginTop: HEIGHT_BASE_RATIO(48),
  },
});

export default CircularTimer;
