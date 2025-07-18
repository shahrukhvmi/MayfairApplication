import { Animated, View, Image } from 'react-native';
import { useEffect, useRef } from 'react';

const AnimatedLogoLoader = () => {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.2,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.Image
      source={require('../assets/images/logo.png')} // replace with your logo path
      style={{
        width: 180,
        height: 180,
        opacity: opacity,
      }}
      resizeMode="contain"
    />
  );
};

export default AnimatedLogoLoader;
