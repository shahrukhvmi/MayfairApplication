// React Native equivalent of the provided Next.js screen
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import useBmiStore from '../store/bmiStore';
import usePatientInfoStore from '../store/patientInfoStore';
import useReorder from '../store/useReorderStore';
import useLastBmi from '../store/useLastBmiStore';
import useReturning from '../store/useReturningPatient';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import TextField from '../Components/TextField';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomCheckbox from '../Components/CustomCheckbox';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

export default function BmiDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const { bmi, setBmi } = useBmiStore();
  const { patientInfo } = usePatientInfoStore();
  const { reorder, reorderStatus } = useReorder();
  const { lastBmi } = useLastBmi();
  const { isReturningPatient } = useReturning();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      checkbox1: false,
      checkbox2: false,
      noneOfTheAbove: false,
      weight_related_comorbidity_explanation: '',
    },
  });

  const checkbox1 = watch('checkbox1');
  const checkbox2 = watch('checkbox2');
  const noneOfTheAbove = watch('noneOfTheAbove');
  const explanation = watch('weight_related_comorbidity_explanation');

  const bmiValue = parseFloat(Number(bmi?.bmi).toFixed(1));
  const shouldShowCheckboxes =
    patientInfo?.ethnicity === 'Yes'
      ? bmiValue >= 25.5 && bmiValue <= 27.4
      : bmiValue >= 27.5 && bmiValue <= 29.9;

  const shouldShowInfoMessage =
    patientInfo?.ethnicity === 'Yes' && bmiValue >= 27.5 && bmiValue <= 29.9;
  const isApproachingUnderweight = bmiValue >= 19.5 && bmiValue <= 21.0;
  const isReorderAndBmiLow = isReturningPatient && bmiValue < 19.4;

  const isEthnicityYes = patientInfo?.ethnicity === 'Yes';
  const isEthnicityNo = patientInfo?.ethnicity === 'No';
  let bmiError = '';

  if (isEthnicityYes && bmiValue < 25.5 && !isReturningPatient) {
    bmiError = 'BMI must be at least 25.5';
  } else if (isEthnicityNo && bmiValue < 27 && !isReturningPatient) {
    bmiError = 'BMI must be at least 27';
  }
  else if (isApproachingUnderweight && isReturningPatient) {
    bmiError = "Your BMI is approaching the lower end of healthy weight. Due to the risk of becoming underweight, you are not able to proceed. Please arrange a telephone consultation with a member of our clinical team to discuss alternatives";
  }


  const isNextDisabled =
    (!isReturningPatient &&
      shouldShowCheckboxes &&
      (noneOfTheAbove ||
        (!checkbox1 && !checkbox2) ||
        (checkbox2 && !explanation?.trim()))) ||
    (isReturningPatient && bmiValue < 20) ||
    bmiError;

  const getCheckbox1Label = () => {
    return patientInfo?.ethnicity === 'Yes' &&
      bmiValue >= 25.5 &&
      bmiValue <= 27.4
      ? 'You have previously taken weight loss medication your starting (baseline) BMI was above 27.5'
      : 'You have previously taken weight loss medication your starting (baseline) BMI was above 30';
  };

  useFocusEffect(
    React.useCallback(() => {
      const consent = bmi?.bmiConsent;
      if (consent) {
        if (consent.previously_taking_medicine?.length)
          setValue('checkbox1', true);
        if (consent.weight_related_comorbidity?.length)
          setValue('checkbox2', true);
        if (consent.weight_related_comorbidity_explanation)
          setValue(
            'weight_related_comorbidity_explanation',
            consent.weight_related_comorbidity_explanation,
          );
        if (consent.assian_message) setValue('noneOfTheAbove', true);
      }
    }, [bmi]));

  useFocusEffect(
    React.useCallback(() => {
      if ((checkbox1 || checkbox2) && noneOfTheAbove)
        setValue('noneOfTheAbove', false);
    }, [checkbox1, checkbox2, noneOfTheAbove]));

  useFocusEffect(
    React.useCallback(() => {
      if (!checkbox2 && explanation)
        setValue('weight_related_comorbidity_explanation', '');
    }, [checkbox2, explanation]));

  const onSubmit = data => {
    const consent = {
      previously_taking_medicine: [],
      weight_related_comorbidity: [],
      weight_related_comorbidity_explanation: '',
      assian_message: '',
    };

    if (!isReturningPatient) {
      consent.assian_message = shouldShowInfoMessage
        ? 'As you have confirmed that you are from one of the following family backgrounds: South Asian, Chinese, Other Asian, Middle Eastern, Black African or African-Caribbean, your cardiometabolic risk occurs at a lower BMI. You are, therefore, able to proceed with a lower BMI.'
        : '';

      if (shouldShowCheckboxes) {
        if (data.checkbox1)
          consent.previously_taking_medicine.push(getCheckbox1Label());
        if (data.checkbox2) {
          consent.weight_related_comorbidity.push(
            'You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)',
          );
          if (data.weight_related_comorbidity_explanation) {
            consent.weight_related_comorbidity_explanation =
              data.weight_related_comorbidity_explanation;
          }
        }
      }
    }

    setBmi({ ...bmi, bmiConsent: consent });
    setShowLoader(true);

    setTimeout(() => {
      if (reorder === true && reorderStatus === false) {
        navigation.navigate('confirmation-summary');
      } else {
        navigation.navigate('medical-questions');
      }
    }, 500);
  };

  return (
    <>
      <Header />

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 16}]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: '70%'}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>70% COMPLETED</Text>
            <Text style={styles.heading}>Your BMI:</Text>
          </View>

          <View style={styles.cardBody}>
            <View style={styles.bmiBox}>
              <Text style={styles.bmiLabel}>YOUR BMI</Text>
              <Text style={styles.bmiValue}>{bmiValue}</Text>
            </View>

            {isReorderAndBmiLow && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>
                  Your BMI is in the underweight category. Therefore, losing further weight is not safe and you are not able to proceed further. Please contact us to discuss your options with the clinical team.
                </Text>
              </View>
            )}

            {shouldShowInfoMessage && !isReturningPatient && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  As you have confirmed that you are from one of the following
                  family backgrounds: South Asian, Chinese, Other Asian, Middle
                  Eastern, Black African or African-Caribbean, your cardiometabolic
                  risk occurs at a lower BMI. You are, therefore, able to proceed
                  with a lower BMI.
                </Text>
              </View>
            )}

            {bmiError !== '' && (
              <View style={styles.alertBox}>
                <Text style={styles.alertText}>{bmiError}</Text>
              </View>
            )}

            {shouldShowCheckboxes && !isReturningPatient && (
              <View style={{marginBottom: 8}}>
                {(patientInfo?.ethnicity === 'No' ||
                  patientInfo?.ethnicity === 'Prefer not to say') && (
                    <Text style={styles.paragraph}>
                      Your BMI is between 27-29.9 which indicates you are overweight.
                    </Text>
                  )}
                <Text style={styles.paragraph}>
                  You should only continue with the consultation if you have tried
                  losing weight through a reduced-calorie diet and increased
                  physical activity but are still struggling to lose weight and
                  confirm that either:
                </Text>

                <Controller
                  name="checkbox1"
                  control={control}
                  render={({ field }) => (
                    <CustomCheckbox
                      label={getCheckbox1Label()}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                <Controller
                  name="checkbox2"
                  control={control}
                  render={({ field }) => (
                    <CustomCheckbox
                      label="You have at least one weight-related comorbidity (e.g. PCOS, diabetes, etc.)"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />

                {checkbox2 && (
                  <Controller
                    name="weight_related_comorbidity_explanation"
                    control={control}
                    rules={{ required: 'Explanation is required' }}
                    render={({ field }) => (
                      <View style={{marginBottom: 12}}>
                        <Text style={styles.label}>
                          Explanation <Text style={styles.required}>*</Text>
                        </Text>
                        <TextInput
                          value={field.value}
                          onChangeText={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Describe your condition(s)"
                          placeholderTextColor="#94a3b8"
                          multiline
                          numberOfLines={4}
                          style={styles.textArea}
                        />
                      </View>
                    )}
                  />
                )}

                <Controller
                  name="noneOfTheAbove"
                  control={control}
                  render={({ field }) => (
                    <CustomCheckbox
                      label="None of the above"
                      value={field.value}
                      tone="danger"
                      onChange={newValue => {
                        field.onChange(newValue);
                        if (newValue) {
                          setValue('checkbox1', false);
                          setValue('checkbox2', false);
                          setValue('weight_related_comorbidity_explanation', '');
                        }
                      }}
                    />
                  )}
                />

                {noneOfTheAbove && (
                  <View style={styles.alertBox}>
                    <Text style={styles.alertText}>
                      Your BMI in this range, weight loss treatment can only be
                      prescribed if you have either previously taken weight loss
                      medication, or you have at least one weight-related medical
                      condition.
                    </Text>
                  </View>
                )}
              </View>
            )}

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                onPress={handleSubmit(onSubmit)}
                disabled={!!isNextDisabled}
                style={styles.submitButton}
              />
              <BackButton
                label="Back"
                onPress={() => navigation.navigate('calculate-bmi')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const PRIMARY = '#47317c';

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
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // BMI value box
  bmiBox: {
    paddingVertical: 32,
    marginBottom: 20,
    backgroundColor: '#f5f2fc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.12)',
    alignItems: 'center',
  },
  bmiLabel: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: 'rgba(71, 49, 124, 0.6)',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 6,
  },
  bmiValue: {
    fontSize: 40,
    fontFamily: Fonts.bold,
    color: PRIMARY,
  },

  alertBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fecaca',
    borderWidth: 1,
    padding: 15,
    borderRadius: 14,
    marginBottom: 16,
  },
  alertText: {
    color: '#b91c1c',
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    lineHeight: 18,
  },
  infoBox: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
    padding: 15,
    borderRadius: 14,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#92400e',
    lineHeight: 18,
  },
  paragraph: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#334155',
    lineHeight: 18,
    marginBottom: 12,
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
  textArea: {
    borderColor: 'rgba(71, 49, 124, 0.15)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#0f172a',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#dc2626',
    marginTop: 8,
  },

  buttonWrap: {
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
