import React from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';

const BmiTextField = ({
  required,
  label,
  name,
  type = 'text',
  fieldProps = {},
  errors = {},
  onBlur,
}) => {
  return (
    <View style={styles.container}>
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
        style={[
          styles.input,
          errors[name] ? styles.inputError : styles.inputDefault,
        ]}
        keyboardType={type === 'number' ? 'numeric' : 'default'}
        onEndEditing={onBlur}
        {...fieldProps}
      />

      {errors[name] && (
        <Text style={styles.errorText}>
          {errors[name]?.message || 'This field is required'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    marginBottom: 6,
    fontSize: 16,
    color: '#111',
  },
  required: {
    color: '#e11d48', // red-500
  },
  optional: {
    fontSize: 14,
    color: '#6b7280', // gray-500
    fontWeight: '400',
  },
  input: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 4,
    fontSize: 16,
    color: '#000',
  },
  inputDefault: {
    borderColor: '#000',
  },
  inputError: {
    borderColor: '#e11d48', // red-500
  },
  errorText: {
    color: '#e11d48',
    fontSize: 14,
    marginTop: 4,
  },
});

export default BmiTextField;
