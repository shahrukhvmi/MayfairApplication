// components/BackButton.js
import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, StyleSheet, View } from 'react-native';

const BackButton = ({
  label = 'Back',
  loading = false,
  disabled = false,
  onPress,
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[style]}
    >
      {loading ? (
        <ActivityIndicator color="#4B0082" size="small" />
      ) : (
        <>
          <View style={{flex:1, flexDirection: 'row', alignItems: 'center' ,justifyContent: 'center'}}>
            <Text style={[styles.text, disabled && styles.disabled]}>
              {label}
            </Text>
          </View>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  text: {
    color: '#4B0082',
    textAlign: 'center',
    fontSize: 14,
    textDecorationLine: 'underline',
    fontWeight: '500',
    marginTop: 16,
  },
  disabled: {
    opacity: 0.5,
  },
});

export default BackButton;
