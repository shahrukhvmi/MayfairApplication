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
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  required: {
    color: 'red',
    fontWeight: '600',
    marginLeft: 4,
  },
  optional: {
    color: '#888',
    fontSize: 12,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
    color: '#000',
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
    backgroundColor: '#eee',
  },
});

export default TextFields;
