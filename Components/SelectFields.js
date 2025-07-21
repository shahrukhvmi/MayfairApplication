// components/SelectField.js
import React from 'react';
import {View, Text, StyleSheet, Platform} from 'react-native';
import {Picker} from '@react-native-picker/picker'; // Make sure this is installed
import Icon from 'react-native-vector-icons/Ionicons'; // or any icon library

const SelectFields = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue, itemIndex) => onChange(itemValue)}
          style={styles.picker}
          mode="dropdown">
          <Picker.Item label="Select an option..." value="" enabled={false} />
          {options.map(opt => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
        {/* <Icon name="chevron-down" size={18} color="#000" style={styles.arrowIcon} /> */}
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error.message || 'This field is required'}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  arrowIcon: {
    position: 'absolute',
    right: 10,
    top: Platform.OS === 'ios' ? 22 : 18,
    pointerEvents: 'none',
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
  },
  required: {
    color: 'red',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderRadius: 6,
    width: '100%',
    borderColor: '#222',
    backgroundColor: '#fff',
    color: '#000',
  },
  picker: {
    height: Platform.OS === 'ios' ? 60 : 60,
    width: '100%',
    color: '#000',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 12,
  },
});

export default SelectFields;
