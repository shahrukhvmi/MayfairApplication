// components/TextField.js

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {Fonts} from '../utils/fonts';

const TextFields = ({
  label,
  placeholder = '',
  type = 'text',
  required = false,
  value,
  onChangeText,
  disabled = false,
  multiline = false,
  numberOfLines = 4,
  disablePaste = false,
  style,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';

  return (
    <View style={[styles.container, style]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required ? (
            <Text style={styles.required}> *</Text>
          ) : (
            <Text style={styles.optional}> (optional)</Text>
          )}
        </View>
      )}

      <View style={styles.inputWrapper}>
        <TextInput
          placeholderTextColor={disabled ? '#999' : '#666'}
          placeholder={placeholder}
          secureTextEntry={isPassword && !showPassword}
          value={value}
          onChangeText={onChangeText}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          onPaste={disablePaste ? () => false : undefined}
          style={[
            styles.input,
            multiline && styles.multiline,
            disabled && styles.disabled,
            isPassword && styles.passwordPadding,
          ]}
        />

        {isPassword && (
          <TouchableOpacity
            style={styles.icon}
            onPress={() => setShowPassword(prev => !prev)}
          >
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 7,
  },
  label: {
    fontSize: 13,
    color: '#334155',
    fontFamily: Fonts.medium,
  },
  required: {
    color: '#ef4444',
    fontFamily: Fonts.medium,
    marginLeft: 4,
  },
  optional: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    color: '#0f172a',
    fontSize: 13,
    fontFamily: Fonts.regular,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  passwordPadding: {
    paddingRight: 40,
  },
  icon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
    zIndex: 1,
  },
  disabled: {
    backgroundColor: '#f1f5f9',
  },
});

export default TextFields;
