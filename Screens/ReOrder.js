import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
// import {FiCheck} from 'react-icons/fi'; // Only valid in Web; for React Native use react-native-vector-icons
import Icon from 'react-native-vector-icons/Feather';

import useReorder from '../store/useReorderStore';
// import useReorderButtonStore from '../store/useReorderButton';
import useReorderBackProcessStore from '../store/useReorderBackProcess';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import PageLoader from '../Components/PageLoader';
import useReorderButtonStore from '../store/useReorderButton';

export default function ReOrder() {
  const navigation = useNavigation();
  const {setReorderStatus} = useReorder();
  const {setIsFromReorder} = useReorderButtonStore();
  const {setReorderBackProcess} = useReorderBackProcessStore();

  const [showLoader, setShowLoader] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: {isValid},
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
    }, []),
  );

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
    <View style={styles.inlineOptionsContainer}>
      {['yes', 'no'].map(option => {
        const isSelected = value === option;

        return (
          <TouchableOpacity
            key={option}
            onPress={() => onChange(option)}
            style={[
              styles.optionBox,
              isSelected ? styles.optionSelected : styles.optionUnselected,
            ]}>
            <View
              style={[styles.iconWrapper, isSelected && styles.iconSelected]}>
              {isSelected && <Icon name="check" size={14} color="#fff" />}
            </View>
            <Text style={[styles.optionText, isSelected && {color: '#4B0082'}]}>
              {option.charAt(0).toUpperCase() + option.slice(1)}
            </Text>
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
          rules={{required: true}}
          render={({field: {value, onChange}}) =>
            renderYesNo('personalUse', value, onChange)
          }
        />

        <NextButton
          style={{marginTop: 30}}
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
    borderColor: '#4B0082',
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
    backgroundColor: '#4B0082',
    borderColor: '#4B0082',
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

  inlineOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 10,
  },

  inlineOptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f9f9f9',
  },

  optionYesSelected: {
    backgroundColor: '#eee7ff',
    borderColor: '#4B0082',
  },

  inlineOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
    textTransform: 'capitalize',
  },
  inlineOptionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 16,
  },

  optionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    flex: 1,
  },

  optionUnselected: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
  },

  optionSelected: {
    backgroundColor: '#f5edff',
    borderColor: '#4B0082',
  },

  iconWrapper: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#4B0082',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },

  iconSelected: {
    backgroundColor: '#4B0082',
    borderColor: '#4B0082',
  },

  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
