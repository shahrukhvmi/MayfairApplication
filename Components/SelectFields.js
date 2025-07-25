import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Icon from 'react-native-vector-icons/Ionicons';

const SelectFields = ({
  label,
  value,
  onChange,
  options = [],
  required = false,
  error,
  placeholder = 'Select an option...',
  style,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState('');

  const selectedLabel =
    options.find(opt => opt.value === value)?.label || placeholder;

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={[styles.container, style]}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}

      <TouchableOpacity
        style={[
          styles.selectBox,
          {
            borderColor: error ? 'red' : value ? '#000' : '#ccc',
          },
        ]}
        onPress={() => {
          setModalVisible(true);
          setSearch('');
        }}
        activeOpacity={0.8}
      >
        <Text style={styles.optionText}
          numberOfLines={1}
          ellipsizeMode="tail">
          {selectedLabel}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#555" style={styles.arrow} />       </TouchableOpacity>

      {error && (
        <Text style={styles.errorText}>
          {error.message || 'This field is required'}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Cross icon */}
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.closeIcon}
            >
              <Icon name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={{
              color: '#000',
              fontSize: 16,
            }}>
              Select or search your address
            </Text>
            <TextInput
              placeholder="Search..."
              value={search}
              placeholderTextColor={"#999"}
              onChangeText={setSearch}
              style={styles.searchInput}
              autoFocus
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={item => item.value.toString()}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onChange(item.value);
                    setModalVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.noResult}>No match found</Text>
              }
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
  selectBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 16,
    color: '#666',
    marginLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    maxHeight: '70%',
    position: 'relative',
  },
  closeIcon: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 1,
    padding: 6,
  },
  searchInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 10,
    marginTop: 34, // to avoid overlapping with close icon
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 16,
    color: '#000',
    maxWidth: '95%', // Ensures it stays inside layout
  },

  noResult: {
    textAlign: 'center',
    padding: 20,
    color: '#666',
  },
});

export default SelectFields;
