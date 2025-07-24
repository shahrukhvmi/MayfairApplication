import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import {FiCheck} from 'react-icons/fi'; // Only valid in Web; for React Native use react-native-vector-icons

import useReorder from '../store/useReorderStore';
// import useReorderButtonStore from '../store/useReorderButton';
import useReorderBackProcessStore from '../store/useReorderBackProcess';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import PageLoader from '../Components/PageLoader';
import useReorderButtonStore from '../store/useReorderButton';

export default function ReOrder() {
  const navigation = useNavigation();
  const { setReorderStatus } = useReorder();
  const { setIsFromReorder } = useReorderButtonStore();
  const { setReorderBackProcess } = useReorderBackProcessStore();

  const [showLoader, setShowLoader] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      personalUse: '',
    },
  });

  const personalUse = watch('personalUse');

  useFocusEffect(
    React.useCallback(() => {
      setReorderBackProcess(false);
    }, []));

  const onSubmit = async data => {
    setIsFromReorder(false);
    setShowLoader(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.personalUse === 'yes') {
      navigation.navigate('signup');
      setReorderStatus(true);
    } else {
      navigation.navigate('calculate-bmi');
      setReorderStatus(false);
      setReorderBackProcess(true);
    }
  };

  const renderYesNo = (fieldName, value, onChange) => (
    <View style={styles.optionsContainer}>
      {['yes', 'no'].map(option => {
        const isSelected = value === option;
        return (
          <TouchableOpacity
            key={option}
            style={[
              styles.optionButton,
              isSelected &&
              (option === 'yes'
                ? styles.optionYesSelected
                : styles.optionNoSelected),
            ]}
            onPress={() => onChange(option)}>
            <View
              style={[
                styles.checkbox,
                isSelected &&
                (option === 'yes' ? styles.checkboxYes : styles.checkboxNo),
              ]}>
              {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.optionText}>{option}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Reorder Confirmation</Text>
        <Text style={styles.paragraph}>
          Has anything changed since your last order?
        </Text>

        <Controller
          control={control}
          name="personalUse"
          rules={{ required: true }}
          render={({ field: { value, onChange } }) =>
            renderYesNo('personalUse', value, onChange)
          }
        />

        <NextButton
          style={{ marginTop: 30 }}
          disabled={!isValid}
          label="I Confirm"
          onPress={handleSubmit(onSubmit)}
        />

        {showLoader && (
          <View style={styles.loaderOverlay}>
            <PageLoader />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
    flexGrow: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'serif',
    marginBottom: 10,
    color: '#111',
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  optionsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  optionYesSelected: {
    backgroundColor: '#eee7ff',
    borderColor: '#7c3aed',
  },
  optionNoSelected: {
    backgroundColor: '#e6ffef',
    borderColor: '#10b981',
  },
  checkbox: {
    width: 22,
    height: 22,
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#ccc',
    backgroundColor: '#fff',
  },
  checkboxYes: {
    backgroundColor: '#7c3aed',
    borderColor: '#7c3aed',
  },
  checkboxNo: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
    color: '#222',
  },
  loaderOverlay: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
