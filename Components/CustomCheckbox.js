// components/CustomCheckbox.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const CustomCheckbox = ({ label, value, onChange }) => {
  const toggleCheckbox = () => {
    onChange(!value); // important: update the form state
  };
  return (
    <TouchableOpacity style={styles.container} onPress={toggleCheckbox}>
      <Ionicons
        name={value ? 'checkbox-outline' : 'square-outline'}
        size={24}
        color="#6D28D9"
      />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});

export default CustomCheckbox;
