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
import { useNavigation } from '@react-navigation/native';
// import TextField from '../Components/TextField';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomCheckbox from '../Components/CustomCheckbox';
import Header from '../Layout/header';

export default function BmiDetail() {
  const [showLoader, setShowLoader] = useState(false);
  const { bmi, setBmi } = useBmiStore();
  const { patientInfo } = usePatientInfoStore();
  const { reorder, reorderStatus } = useReorder();
  const { lastBmi } = useLastBmi();
  const { isReturningPatient } = useReturning();
  const navigation = useNavigation();

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

  useEffect(() => {
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
  }, [bmi]);

  useEffect(() => {
    if ((checkbox1 || checkbox2) && noneOfTheAbove)
      setValue('noneOfTheAbove', false);
  }, [checkbox1, checkbox2, noneOfTheAbove]);

  useEffect(() => {
    if (!checkbox2 && explanation)
      setValue('weight_related_comorbidity_explanation', '');
  }, [checkbox2, explanation]);

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

  // This is just the logic + hooks — UI rendering section would go below, similar to how it was structured in Next.js
  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.bmiBox}>
          <Text style={styles.bmiText}>BMI: {bmiValue}</Text>
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
          <View style={{ marginBottom: 24 }}>
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
                  <TextInput
                    value={field.value}
                    onChangeText={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="Explanation"
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                  />
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
              <Text style={styles.errorText}>
                Your BMI in this range, weight loss treatment can only be
                prescribed if you have either previously taken weight loss
                medication, or you have at least one weight-related medical
                condition.
              </Text>
            )}
          </View>
        )}

        <NextButton
          label="Next"
          onPress={handleSubmit(onSubmit)}
          disabled={!!isNextDisabled}
        />
        <BackButton
          label="Back"
          onPress={() => navigation.navigate('calculate-bmi')}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: '#f8f5ff',
    flexGrow: 1,
  },
  bmiBox: {
    paddingVertical: 32,
    marginBottom: 20,
    backgroundColor: '#EDE9FE',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#dcdcdc',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  bmiText: {
    fontSize: 28,
    color: '#000',
    fontWeight: 'bold',
  },
  alertBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    color: '#B91C1C',
    fontSize: 14,
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    padding: 16,
    borderRadius: 8,
    marginTop: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#444',
  },
  paragraph: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    flexWrap: 'wrap',
  },
  textArea: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    marginTop: 8,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
