import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CheckoutSection = ({
  stepNumber,
  title,
  subtitle,
  isCompleted,
  isOpen,
  onToggle,
  children,
  onLayout,
}) => {
  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  return (
    <View style={styles.card} onLayout={onLayout}>
      <TouchableOpacity
        style={styles.header}
        activeOpacity={0.8}
        onPress={handleToggle}>
        <View style={[styles.circle, isCompleted && styles.circleCompleted]}>
          {isCompleted ? (
            <Feather name="check" size={13} color="#fff" />
          ) : (
            <Text style={styles.circleText}>{stepNumber}</Text>
          )}
        </View>
        <View style={{flex: 1}}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Feather
          name={isOpen ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#64748b"
        />
      </TouchableOpacity>

      {isOpen && <View style={styles.body}>{children}</View>}
    </View>
  );
};

export default CheckoutSection;

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: 'rgba(71, 49, 124, 0.12)',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f2fc',
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: PRIMARY,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleCompleted: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  circleText: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },
  title: {
    fontSize: 14.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 2,
  },
  body: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
  },
});
