// components/CustomCheckbox.js
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const CustomCheckbox = ({label, value, onChange, tone = 'default'}) => {
  const toggleCheckbox = () => {
    onChange(!value);
  };

  const isDanger = tone === 'danger';

  return (
    <TouchableOpacity
      style={[
        styles.container,
        value && (isDanger ? styles.containerDangerActive : styles.containerActive),
      ]}
      activeOpacity={0.8}
      onPress={toggleCheckbox}>
      <View
        style={[
          styles.checkbox,
          value && (isDanger ? styles.checkboxDangerActive : styles.checkboxActive),
        ]}>
        {value && <Feather name="check" size={12} color="#fff" />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#FBFBFD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  containerActive: {
    borderColor: 'rgba(71, 49, 124, 0.2)',
    backgroundColor: 'rgba(71, 49, 124, 0.03)',
  },
  containerDangerActive: {
    borderColor: '#fecaca',
    backgroundColor: 'rgba(254, 242, 242, 0.5)',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  checkboxDangerActive: {
    borderColor: '#f87171',
    backgroundColor: '#f87171',
  },
  label: {
    flex: 1,
    fontSize: 12.5,
    color: '#1e293b',
    lineHeight: 18,
    fontFamily: Fonts.medium,
  },
});

export default CustomCheckbox;
