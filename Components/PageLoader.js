import React, { useEffect } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const PageLoader = () => {
  const rotateValue = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotateInterpolate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.overlay}>
      <Animated.View
        style={[
          styles.spinner,
          {
            transform: [{ rotate: rotateInterpolate }],
          },
        ]}
      />
    </View>
  );
};

export default PageLoader;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  spinner: {
    width: 48,
    height: 48,
    borderWidth: 4,
    borderColor: '#8B5CF6', // Tailwind's violet-600
    borderTopColor: 'transparent',
    borderRadius: 999,
  },
});
