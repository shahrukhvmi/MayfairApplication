import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';
import {Fonts} from '../utils/fonts';

const BmiTextField = ({
  required,
  label,
  name,
  type = 'numeric',
  fieldProps = {},
  errors = {},
  onBlur,
  readOnly = false,
  disabled = false,
  style,
}) => {
  const showError = !!errors[name];
  const editable = !readOnly && !disabled;

  return (
    <View style={[styles.fieldWrapper, style]}>
      {label && (
        <Text style={styles.label}>
          {label}
          {required ? (
            <Text style={styles.required}> *</Text>
          ) : (
            <Text style={styles.optional}> (optional)</Text>
          )}
        </Text>
      )}

      <TextInput
        editable={editable}
        onBlur={onBlur}
        style={[
          styles.input,
          showError && styles.errorInput,
          !editable && styles.disabledInput,
        ]}
        placeholderTextColor="#9ca3af"
        keyboardType={type}
        {...fieldProps}
      />

      {showError && (
        <Text style={styles.errorText}>
          {errors[name]?.message || 'This field is required'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fieldWrapper: {
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    marginBottom: 8,
    color: '#334155',
    fontFamily: Fonts.medium,
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    color: '#94a3b8',
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#0f172a',
    fontSize: 13,
    fontFamily: Fonts.regular,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  disabledInput: {
    opacity: 0.5,
    backgroundColor: '#f1f5f9',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 6,
  },
});

export default BmiTextField;
