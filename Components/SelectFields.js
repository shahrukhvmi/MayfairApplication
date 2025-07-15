import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const SelectFields = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error,
  searchable = false,
  searchPlaceholder = "Search...",
}) => {
  const [searchText, setSearchText] = useState("");

  // Filter based on label
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      {searchable && (
        <TextInput
          placeholder={searchPlaceholder}
          value={searchText}
          onChangeText={setSearchText}
          style={styles.searchInput}
        />
      )}

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={value}
          onValueChange={(itemValue, itemIndex) => {
            const selected = filteredOptions.find(opt => opt.value === itemValue);
            onChange(selected); // Pass whole selected object
          }}
          style={styles.picker}
          mode="dropdown"
        >
          <Picker.Item label="Select an option..." value="" enabled={false} />
          {filteredOptions.map((opt) => (
            <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
          ))}
        </Picker>
      </View>

      {error && (
        <Text style={styles.errorText}>
          {error.message || "This field is required"}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  required: { color: 'red' },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
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
  searchInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
});

export default SelectFields;
