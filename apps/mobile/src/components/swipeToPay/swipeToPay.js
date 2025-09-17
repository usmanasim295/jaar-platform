import React, {useCallback} from 'react';
import {View, Text, StyleSheet, Dimensions, I18nManager} from 'react-native';
import {PanGestureHandler} from 'react-native-gesture-handler';
import Animated, {
  interpolateColor,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  FONT_SIZE,
  HEIGHT_BASE_RATIO,
  WIDTH_BASE_RATIO,
} from '../../utils/helpers';
import {Colors} from '../../generalStyles/theme';
import {Fonts} from '../../generalStyles/fontStyles';
import {Arrow} from '../../assets/icons';
import {useTranslation} from 'react-i18next';

const {width} = Dimensions.get('window');
const BUTTON_WIDTH = width * 0.85;
const SLIDER_SIZE = 50;
const SWIPE_THRESHOLD = BUTTON_WIDTH - SLIDER_SIZE - 10;

export default function SwipeToPay({onPay}) {
  const translateX = useSharedValue(0);
  const {t} = useTranslation();

  const handleComplete = useCallback(() => {
    onPay?.();
  }, [onPay]);

  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx) => {
      ctx.startX = translateX.value;
    },
    onActive: (event, ctx) => {
      translateX.value = Math.min(
        Math.max(ctx.startX + event.translationX, 0),
        BUTTON_WIDTH - SLIDER_SIZE,
      );
    },
    onEnd: () => {
      if (translateX.value > SWIPE_THRESHOLD) {
        translateX.value = withSpring(BUTTON_WIDTH - SLIDER_SIZE, {}, () => {
          runOnJS(handleComplete)();
        });
      } else {
        translateX.value = withSpring(0);
      }
    },
  });

  const sliderStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const textOpacity = useAnimatedStyle(() => ({
    opacity: 1 - translateX.value / (BUTTON_WIDTH - SLIDER_SIZE),
  }));

  // 🔹 Animated background color change
  const containerStyle = useAnimatedStyle(() => {
    const backgroundColor = interpolateColor(
      translateX.value,
      [0, BUTTON_WIDTH - SLIDER_SIZE],
      [Colors.White, Colors.Primary],
    );
    return {backgroundColor};
  });

  return (
    <Animated.View style={[styles.swipeButton, containerStyle]}>
      <Animated.Text style={[styles.text, textOpacity]}>
        {t('swipeToPay')}
      </Animated.Text>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.slider, sliderStyle]}>
          <Arrow />
        </Animated.View>
      </PanGestureHandler>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  swipeButton: {
    width: '100%',
    height: HEIGHT_BASE_RATIO(60),
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.Stroke,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: FONT_SIZE(4),
    marginBottom: HEIGHT_BASE_RATIO(35),
  },
  text: {
    position: 'absolute',
    alignSelf: 'center',
    ...Fonts.Jakarta_Sans_SemiBold_14_Black,
  },
  slider: {
    width: WIDTH_BASE_RATIO(96),
    height: HEIGHT_BASE_RATIO(52),
    borderRadius: FONT_SIZE(34),
    backgroundColor: Colors.Primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrow: {
    fontSize: 24,
    color: Colors.White,
  },
});
