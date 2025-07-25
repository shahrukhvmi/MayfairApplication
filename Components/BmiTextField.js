import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

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
}) => {
  const showError = !!errors[name];
  const editable = !readOnly && !disabled;

  return (
    <View style={styles.fieldWrapper}>
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
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 4,
    color: '#000',
  },
  required: {
    color: '#ef4444',
  },
  optional: {
    color: '#6b7280',
    fontSize: 12,
    fontWeight: '400',
    marginLeft: 4,
  },
  input: {
    width: '100%',
    backgroundColor: '#fff',
    color: '#000',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBCBCB66',
  },
  errorInput: {
    borderColor: '#ef4444',
  },
  disabledInput: {
    opacity: 0.5,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
});

export default BmiTextField;
