import {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PhoneInput from 'react-native-phone-number-input';
import {Flag} from 'react-native-country-picker-modal';
import {useForm, Controller} from 'react-hook-form';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import usePatientInfoStore from '../store/patientInfoStore';
import useReturning from '../store/useReturningPatient';

export default function PreferredPhoneNumber() {
  const navigation = useNavigation();
  const phoneInputRef = useRef(null);
  const phoneNumberRef = useRef('');
  const countryCodeRef = useRef('GB');

  const {isReturningPatient} = useReturning();
  const {patientInfo, setPatientInfo} = usePatientInfoStore();

  // Prefill: backend "phone" (ya app-saved "phoneNo") — country code (+44) strip karke national number
  const rawPhone = patientInfo?.phoneNo || '';
  const nationalPhone = rawPhone.replace(/^\+44/, '');

  console.log(patientInfo);

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      phoneNo: rawPhone,
    },
  });

  useEffect(() => {
    if (rawPhone) {
      phoneNumberRef.current = nationalPhone;
      setValue('phoneNo', rawPhone);
      trigger('phoneNo');
    }
  }, [rawPhone]);

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

  const renderImageFlag = ({countryCode: cc}) => (
    <Flag
      countryCode={cc}
      flagSize={22}
      withEmoji={false}
      withFlagButton={true}
    />
  );

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
            validate: () => {
              const digits = phoneNumberRef.current.replace(/\D/g, '');
              if (digits.length < 6) return 'Phone number is too short';
              if (digits.length > 15)
                return 'Phone number cannot exceed 15 digits';
              return true;
            },
          }}
          render={({field: {onChange}}) => (
            <>
              <PhoneInput
                ref={phoneInputRef}
                key={nationalPhone}
                defaultCode="GB"
                defaultValue={nationalPhone}
                onChangeText={text => {
                  phoneNumberRef.current = text;
                }}
                onChangeFormattedText={text => {
                  onChange(text);
                  trigger('phoneNo');
                }}
                onChangeCountry={country => {
                  countryCodeRef.current = country.cca2;
                  trigger('phoneNo');
                }}
                countryPickerProps={{
                  withEmoji: false,
                  renderFlagButton: renderImageFlag,
                }}
                containerStyle={styles.phoneContainer}
                textContainerStyle={styles.textContainer}
                flagButtonStyle={styles.flagButton}
                codeTextStyle={styles.codeText}
                textInputStyle={styles.textInput}
                textInputProps={{
                  placeholder: 'Enter phone number',
                  placeholderTextColor: '#999',
                }}
                autoFocus
              />
              {errors.phoneNo && (
                <Text style={styles.errorText}>{errors.phoneNo.message}</Text>
              )}
            </>
          )}
        />

        {/* Next / Back Buttons (baaki screens jaise) */}
        <NextButton
          style={{marginTop: 30}}
          label="Next"
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        />
        <BackButton
          label="Back"
          onPress={() => navigation.navigate('residential-address')}
        />
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
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  textContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  flagButton: {
    width: 69,
    marginRight: -8,
  },
  codeText: {
    marginLeft: 0,
    marginRight: 4,
    fontSize: 15,
    color: '#111',
  },
  textInput: {
    fontSize: 15,
    color: '#111',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 13,
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    backgroundColor: '#4B0082',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backBtn: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  backText: {
    color: '#4B0082',
    textDecorationLine: 'underline',
    fontSize: 14,
  },
});
