import React, { useEffect } from 'react';
import { View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withRepeat } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import loadingStyles from '../styles/loadingStyles';

interface Props {
    width?: number;
    height?: number;
    duration?: number;
    gradientWidth?: number;
    borderRadius?: number;
    style?: ViewStyle;
}

export default function SkeletonSmall ({
    width = 200,
    height = 20,
    duration = 1200,
    gradientWidth = 150,
    borderRadius = 4,
    style,
} : Props) {
  const translateX = useSharedValue(-gradientWidth); // start off-screen left

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(width, { duration }),
      -1,
      true
    );
  }, [width, duration]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return (
    <View style={[ loadingStyles.container, { width, height, borderRadius }, style ]}>
      <Animated.View style={[ { width: gradientWidth, height }, animatedStyle ]}>
        <LinearGradient
          colors={['#eeeeee', '#dddddd', '#eeeeee']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1 }}
        />
      </Animated.View>
    </View>
  );
}