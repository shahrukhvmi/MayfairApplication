// components/NextButton.js
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NextButton = ({ 
  label = 'Next', 
  loading = false, 
  disabled = false, 
  onPress, 
  style 
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        disabled || loading ? styles.disabled : styles.enabled,
        style, // for custom overrides
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.label}>Loading...</Text>
        </>
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
    width: '100%',
  },
  enabled: {
    backgroundColor: '#4B0082',
  },
  disabled: {
    backgroundColor: '#ccc',
  },
  label: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default NextButton;
