// components/PostcodeSearchInput.js

import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PostcodeSearchInput = ({
  label,
  placeholder = '',
  value,
  onChangeText,
  handleSearch,
  addressSearchLoading,
  required = false,
  errors,
  isSearchAllowed = true, // New prop to control if the search button should appear
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}>*</Text>}
        </View>
      )}

      {/* Input Field */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          style={styles.input}
        />

        {/* Search Icon - Conditionally rendered */}
        {isSearchAllowed && (
          <TouchableOpacity
            style={styles.icon}
            onPress={handleSearch}
            disabled={addressSearchLoading}>
            {addressSearchLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {errors && <Text style={styles.error}>{errors}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  required: {
    color: 'red',
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 4,
    padding: 12,
    backgroundColor: '#fff',
    color: '#000',
  },
  icon: {
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1,
    padding: 10,
    backgroundColor: '#4B0082',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    width: 50,
  },
  error: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default PostcodeSearchInput;
