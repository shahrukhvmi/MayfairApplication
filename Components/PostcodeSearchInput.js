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
import Feather from 'react-native-vector-icons/Feather';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const PostcodeSearchInput = ({
  label,
  placeholder = '',
  value,
  onChangeText,
  handleSearch,
  addressSearchLoading,
  required = false,
  errors,
  isSearchAllowed = true,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>{label}</Text>
          {required && <Text style={styles.required}> *</Text>}
        </View>
      )}

      {/* Input Field */}
      <View style={styles.inputWrapper}>
        <TextInput
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          value={value}
          onChangeText={onChangeText}
          style={[styles.input, isSearchAllowed && styles.inputWithButton]}
        />

        {isSearchAllowed && (
          <TouchableOpacity
            style={styles.searchButton}
            onPress={handleSearch}
            disabled={addressSearchLoading}
            activeOpacity={0.85}>
            {addressSearchLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather name="search" size={13} color="#fff" />
                <Text style={styles.searchButtonText}>Search</Text>
              </>
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
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
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
  },
  inputWrapper: {
    position: 'relative',
    justifyContent: 'center',
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
  inputWithButton: {
    paddingRight: 96,
  },
  searchButton: {
    position: 'absolute',
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: PRIMARY,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchButtonText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: Fonts.medium,
  },
  error: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 6,
    fontFamily: Fonts.regular,
  },
});

export default PostcodeSearchInput;
