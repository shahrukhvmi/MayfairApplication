import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useState, useEffect} from 'react';
import {Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {differenceInYears, parse, format} from 'date-fns';

import usePatientInfoStore from '../store/patientInfoStore';
import useProductId from '../store/useProductIdStore';

import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 30;

export default function PersonalDetails() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {patientInfo, setPatientInfo} = usePatientInfoStore();
  const {productId} = useProductId();

  const {
    control,
    setValue,
    watch,
    handleSubmit,
    trigger,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      dob: null,
      gender: '',
      pregnancy: '',
    },
  });

  const gender = watch('gender');
  const pregnancy = watch('pregnancy');

  const [showPicker, setShowPicker] = useState(false);

  const validateAge = date => {
    if (!date) return 'Date of birth is required';

    const today = new Date();
    const age = differenceInYears(today, date);

    if (age < 18) {
      return 'You must be at least 18 years old';
    }

    const birthDate = new Date(date);
    const eightyFifthBirthday = new Date(
      birthDate.getFullYear() + 85,
      birthDate.getMonth(),
      birthDate.getDate(),
    );

    const isOver85 = today > eightyFifthBirthday;

    if (Number(productId) === 1 && isOver85) {
      return 'Wegovy (Semaglutide) is not recommended for individuals above 85 years of age';
    }

    if (Number(productId) === 11 && isOver85) {
      return 'Wegovy Pill is not recommended for individuals above 85 years of age';
    }

    if (Number(productId) === 4 && isOver85) {
      return 'Mounjaro (Tirzepatide) is not recommended for individuals above 85 years of age';
    }

    return true;
  };

  useEffect(() => {
    if (patientInfo?.dob) {
      const parsedDate = parse(patientInfo.dob, 'dd-MM-yyyy', new Date());
      const fixedGender = patientInfo?.gender
        ? patientInfo.gender.charAt(0).toUpperCase() +
          patientInfo.gender.slice(1).toLowerCase()
        : '';

      setValue('dob', parsedDate);
      setValue('gender', fixedGender);
    }

    if (patientInfo?.pregnancy) {
      setValue('pregnancy', patientInfo.pregnancy);
    }

    if (patientInfo?.dob) {
      trigger(['dob', 'pregnancy']);
    }
  }, [patientInfo, patientInfo?.gender]);

  useEffect(() => {
    if (gender === 'Male') {
      setValue('pregnancy', '');
      trigger();
    } else if (gender === 'Female') {
      trigger('pregnancy');
    }
  }, [gender]);

  const formatDate = date => date.toLocaleDateString('en-GB');

  const onSubmit = data => {
    const formattedDOB = format(data.dob, 'dd-MM-yyyy');

    setPatientInfo({
      ...patientInfo,
      dob: formattedDOB,
      gender: data.gender,
      pregnancy: data.pregnancy || '',
    });

    navigation.navigate('residential-address');
  };

  const RadioPill = ({option, label, selected, onPress, disabled}) => (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.optionPill,
        selected && styles.optionPillActive,
        disabled && {opacity: 0.5},
      ]}>
      <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
        {selected && <View style={styles.radioDot} />}
      </View>
      <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      <Header />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${PERCENTAGE}%`}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>{PERCENTAGE}% COMPLETED</Text>
            <Text style={styles.heading}>Mention your sex at birth</Text>
            <Text style={styles.description}>
              This refers to your sex when you were born. We ask this because
              a range of health issues are specific to people based on their
              sex at birth.
            </Text>
          </View>

          <View style={styles.cardBody}>
            {/* Gender */}
            <Controller
              control={control}
              name="gender"
              rules={{required: 'Please select your sex at birth'}}
              render={({field: {value, onChange}}) => (
                <View style={styles.optionRow}>
                  {['Male', 'Female'].map(option => (
                    <RadioPill
                      key={option}
                      option={option}
                      label={option}
                      selected={value === option}
                      onPress={() => onChange(option)}
                    />
                  ))}
                </View>
              )}
            />
            {errors?.gender && (
              <Text style={styles.errorText}>{errors.gender.message}</Text>
            )}

            {/* Pregnancy */}
            {gender === 'Female' && (
              <View style={styles.pregnancyBox}>
                <Text style={styles.pregnancyTitle}>
                  Are you pregnant, breastfeeding, or trying to conceive?
                </Text>
                <Text style={styles.pregnancySubtitle}>
                  Our treatment programme is not suitable while breastfeeding,
                  pregnant, or trying to conceive.
                </Text>

                <Controller
                  control={control}
                  name="pregnancy"
                  rules={{
                    required:
                      gender === 'Female' ? 'Please select an option' : false,
                  }}
                  render={({field: {onChange, value}}) => (
                    <View style={styles.optionRow}>
                      {['yes', 'no'].map(option => (
                        <RadioPill
                          key={option}
                          option={option}
                          label={option === 'yes' ? 'Yes' : 'No'}
                          selected={value === option}
                          onPress={() => onChange(option)}
                        />
                      ))}
                    </View>
                  )}
                />

                {pregnancy === 'yes' && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      This treatment is not suitable if you are pregnant,
                      trying to get pregnant or breastfeeding. We recommend
                      you speak to your GP in person.
                    </Text>
                  </View>
                )}

                {errors?.pregnancy && (
                  <Text style={styles.errorText}>
                    {errors.pregnancy.message}
                  </Text>
                )}
              </View>
            )}

            {/* Date of Birth */}
            <View style={styles.dobWrap}>
              <Text style={styles.label}>
                Date of Birth <Text style={styles.required}>*</Text>
              </Text>
              <Controller
                control={control}
                name="dob"
                rules={{validate: validateAge}}
                render={({field: {value, onChange}}) => (
                  <>
                    <TouchableOpacity
                      style={styles.dobInput}
                      activeOpacity={0.8}
                      onPress={() => setShowPicker(true)}>
                      <Text
                        style={[
                          styles.dobText,
                          !value && styles.dobPlaceholder,
                        ]}>
                        {value ? formatDate(value) : 'Select your date of birth'}
                      </Text>
                      <Feather name="calendar" size={17} color="#94a3b8" />
                    </TouchableOpacity>
                    {showPicker && (
                      <DateTimePicker
                        value={value || new Date(Date.UTC(1990, 0, 1))}
                        mode="date"
                        display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                        onChange={(event, selectedDate) => {
                          setShowPicker(false);
                          if (selectedDate) {
                            const normalized = new Date(
                              selectedDate.getFullYear(),
                              selectedDate.getMonth(),
                              selectedDate.getDate(),
                            );
                            onChange(normalized);
                          }
                        }}
                        minimumDate={new Date(1900, 0, 1)}
                        maximumDate={new Date()}
                      />
                    )}
                  </>
                )}
              />
              {errors?.dob && (
                <Text style={styles.errorText}>{errors.dob.message}</Text>
              )}
            </View>

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                disabled={!isValid || (gender === 'Female' && pregnancy === 'yes')}
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
              />
              <BackButton
                label="Back"
                onPress={() => navigation.navigate('signup')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
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

  // Options
  optionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  optionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionPillActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.05)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  optionLabelActive: {
    color: PRIMARY,
  },
  errorText: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#ef4444',
    marginTop: 8,
  },

  // Pregnancy box
  pregnancyBox: {
    marginTop: 22,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#FBFBFD',
    borderRadius: 14,
    padding: 18,
  },
  pregnancyTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 5,
  },
  pregnancySubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 18,
    marginBottom: 14,
  },
  warningBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  warningText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#dc2626',
    lineHeight: 18,
  },

  // DOB
  dobWrap: {
    marginTop: 22,
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
  dobInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dobText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#0f172a',
  },
  dobPlaceholder: {
    color: '#94a3b8',
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
