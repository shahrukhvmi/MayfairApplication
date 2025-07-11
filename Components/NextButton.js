import React from 'react';
import {
  ActivityIndicator,
  Text,
  TouchableOpacity,
  StyleSheet,
  View,
} from 'react-native';

const NextButton = ({
  label = 'Next',
  loading = false,
  disabled = false,
  onPress,
  style,
}) => {
  const handlePress = () => {
    if (!disabled && !loading && onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled || loading}
      style={[
        styles.button,
        disabled || loading ? styles.disabled : styles.enabled,
        style,
      ]}
    >
      {loading ? (
        <View style={styles.loadingContent}>
          <ActivityIndicator color="#fff" style={styles.spinner} />
          <Text style={styles.label}>Loading...</Text>
        </View>
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: 30,
    width: '80%',
    alignSelf: 'center',
  },
  enabled: {
    backgroundColor: '#4B0082',
  },
  disabled: {
    backgroundColor: '#aaa',
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spinner: {
    marginRight: 8,
  },
});

export default NextButton;
