import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PhoneInput from 'react-native-international-phone-number';
import {useForm, Controller} from 'react-hook-form';

import Header from '../Layout/header';
import usePatientInfoStore from '../store/patientInfoStore';
import useReturning from '../store/useReturningPatient';

export default function PreferredPhoneNumber() {
  const navigation = useNavigation();
  const [selectedCountry, setSelectedCountry] = useState(null);
  const {isReturningPatient} = useReturning();
  const {patientInfo, setPatientInfo} = usePatientInfoStore();

  const {
    control,
    handleSubmit,
    setValue,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      phoneNo: patientInfo?.phoneNo || '',
    },
  });

  useEffect(() => {
    if (patientInfo?.phoneNo) {
      setValue('phoneNo', patientInfo.phoneNo);
    }
  }, [patientInfo]);

  const onSubmit = data => {
    setPatientInfo({
      ...patientInfo,
      phoneNo: data.phoneNo,
    });

    if (isReturningPatient) {
      navigation.navigate('calculate-bmi');
    } else {
      navigation.navigate('ethnicity');
    }
  };

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.select({ios: 'padding', android: undefined})}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>50% Completed</Text>

        {/* Heading */}
        <Text style={styles.heading}>Enter your phone number</Text>
        <Text style={styles.subText}>
          Please provide an active phone number to ensure smooth delivery of
          your order.
        </Text>

        {/* Phone Input */}
        <Controller
          control={control}
          name="phoneNo"
          rules={{
            required: 'Phone number is required',
            validate: value => {
              const onlyDigits = value?.replace(/\D/g, '');
              if (!onlyDigits || onlyDigits.length < 6)
                return 'Enter a valid phone number';
              if (onlyDigits.length > 15)
                return "Phone number can't exceed 15 digits";
              return true;
            },
          }}
          render={({field: {onChange, value}}) => (
            <>
              <PhoneInput
                defaultCountry="GB"
                value={value}
                onChangePhoneNumber={text => onChange(text)}
                selectedCountry={selectedCountry}
                onChangeSelectedCountry={country =>
                  setSelectedCountry(country)
                }
                containerStyle={styles.phoneContainer}
                inputStyle={styles.textInput}
                autoFocus
              />
              {errors.phoneNo && (
                <Text style={styles.errorText}>{errors.phoneNo.message}</Text>
              )}
            </>
          )}
        />

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.disabledBtn]}
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.navigate('residential-address')}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F7FD',
    padding: 20,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
    marginTop: 20,
  },
  progressBar: {
    width: '50%',
    height: 4,
    backgroundColor: '#4B0082',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'serif',
    color: '#222',
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 25,
  },
  phoneContainer: {
    width: '100%',
    height: 60,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginTop: 4,
    fontSize: 13,
  },
  nextButton: {
    backgroundColor: '#4B0082',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    textAlign: 'center',
    color: '#4B0082',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
