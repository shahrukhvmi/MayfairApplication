import {useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import PhoneInput from 'react-native-phone-number-input';
import {Flag} from 'react-native-country-picker-modal';
import {useForm, Controller} from 'react-hook-form';

import Header from '../Layout/header';
import {Fonts} from '../utils/fonts';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import usePatientInfoStore from '../store/patientInfoStore';
import useReturning from '../store/useReturningPatient';

const PRIMARY = '#47317c';
const PERCENTAGE = 50;

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
        style={styles.screen}
        behavior={Platform.select({ios: 'padding', android: undefined})}>
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${PERCENTAGE}%`}]} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.progressLabel}>
                {PERCENTAGE}% COMPLETED
              </Text>
              <Text style={styles.heading}>Enter your phone number</Text>
              <Text style={styles.description}>
                Please provide an active phone number to ensure smooth
                delivery of your order.
              </Text>
            </View>

            <View style={styles.cardBody}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
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
                    <View
                      style={[
                        styles.phoneWrap,
                        errors.phoneNo && styles.phoneWrapError,
                      ]}>
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
                          placeholder: 'e.g. 7700 900123',
                          placeholderTextColor: '#94a3b8',
                        }}
                        autoFocus
                      />
                    </View>
                    {errors.phoneNo && (
                      <Text style={styles.errorText}>
                        {errors.phoneNo.message}
                      </Text>
                    )}
                  </>
                )}
              />

              <View style={styles.buttonWrap}>
                <NextButton
                  label="Next"
                  disabled={!isValid}
                  onPress={handleSubmit(onSubmit)}
                  style={styles.submitButton}
                />
                <BackButton
                  label="Back"
                  onPress={() => navigation.navigate('residential-address')}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },

  // Progress bar
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: 'rgba(71, 49, 124, 0.15)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#f5f2fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.08)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  progressLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: 'rgba(71, 49, 124, 0.7)',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  heading: {
    fontSize: 21,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 18,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },

  label: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },

  phoneWrap: {
    borderBottomWidth: 2,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 6,
  },
  phoneWrapError: {
    borderBottomColor: '#f87171',
  },
  phoneContainer: {
    width: '100%',
    borderRadius: 0,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  textContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  flagButton: {
    width: 60,
    marginRight: -8,
  },
  codeText: {
    marginLeft: 0,
    marginRight: 4,
    fontSize: 14,
    color: '#1e293b',
  },
  textInput: {
    fontSize: 14,
    color: '#1e293b',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 8,
  },

  buttonWrap: {
    marginTop: 24,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
