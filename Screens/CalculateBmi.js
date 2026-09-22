import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import useLastBmi from '../store/useLastBmiStore';
import useReorder from '../store/useReorderStore';
import useBmiStore from '../store/bmiStore';
import {Controller, useForm} from 'react-hook-form';
import SwitchTabs from '../Components/SwitchTabs';
import BmiTextField from '../Components/BmiTextField';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useReorderBackProcessStore from '../store/useReorderBackProcess';
import useReturning from '../store/useReturningPatient';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const validateRange = (value, min, max, wholeOnly, message) => {
  const num = Number(value);
  if (isNaN(num)) return message;
  if (wholeOnly && !Number.isInteger(num)) return message;
  if (num < min || num > max) return message;
  return true;
};

export default function CalculateBmi() {
  const [localStep, setLocalStep] = useState(1);
  const [heightUnit, setHeightUnit] = useState('metrics');
  const [weightUnit, setWeightUnit] = useState('metrics');
  const [showLoader, setShowLoader] = useState(false);
  const [heightUnitKey, setHeightUnitKey] = useState(''); // Will be "imperial" or "metrics"
  const [weightUnitKey, setWeightUnitKey] = useState('');
  const {reorder, reorderStatus} = useReorder();
  const {lastBmi} = useLastBmi();
  const {reorderBackProcess} = useReorderBackProcessStore();

  const {bmi, setBmi} = useBmiStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {isReturningPatient} = useReturning();
  const {
    register,
    handleSubmit,
    trigger,
    setValue,
    watch,
    getValues,
    control,
    formState: {errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      heightFt: '',
      heightIn: '',
      heightCm: '',
      weightSt: '',
      weightLbs: '',
      weightKg: '',
    },
  });

  const heightFt = watch('heightFt');
  const heightIn = watch('heightIn');
  const heightCm = watch('heightCm');

  const weightSt = watch('weightSt');
  const weightLbs = watch('weightLbs');
  const weightKg = watch('weightKg');

  // Load values from store
  useEffect(() => {
    console.log(bmi?.ft, '====================== this is bmi ft');

    setValue('heightFt', bmi?.ft);
    setValue('heightIn', bmi?.inch);
    setValue('heightCm', bmi?.cm);
    // setValue("weightSt", bmi?.stones);
    // setValue("weightLbs", bmi?.pound);
    // setValue("weightKg", bmi?.kg);

    // Detect units based on which fields are filled
    if (bmi?.cm) {
      setHeightUnit('metrics');
      setHeightUnitKey('metrics');
    } else if (bmi?.ft || bmi?.inch) {
      setHeightUnit('imperial');
      setHeightUnitKey('imperial');
    }

    if (bmi?.kg) {
      setWeightUnit('metrics');
      setWeightUnitKey('metrics');
    } else if (bmi?.stones || bmi?.pound) {
      setWeightUnit('imperial');
      setWeightUnitKey('imperial');
    }

    if (
      bmi?.ft ||
      bmi?.inch ||
      bmi?.cm ||
      bmi?.stones ||
      bmi?.pound ||
      bmi?.kg
    ) {
      trigger([
        'heightFt',
        'heightIn',
        'heightCm',
        'weightSt',
        'weightLbs',
        'weightKg',
      ]);
    }
  }, [bmi, setValue, trigger]);

  const isStepValid = () => {
    if (localStep === 1) {
      if (heightUnit === 'imperial') {
        return (
          !errors.heightFt &&
          !errors.heightIn &&
          heightFt !== '' &&
          heightFt !== undefined &&
          heightFt !== null &&
          heightIn !== '' &&
          heightIn !== undefined &&
          heightIn !== null
        );
      } else {
        return (
          !errors.heightCm &&
          heightCm !== '' &&
          heightCm !== undefined &&
          heightCm !== null
        );
      }
    } else {
      if (weightUnit === 'metrics') {
        return (
          !errors.weightKg &&
          weightKg !== '' &&
          weightKg !== undefined &&
          weightKg !== null
        );
      } else {
        return (
          !errors.weightSt &&
          !errors.weightLbs &&
          weightSt !== '' &&
          weightSt !== undefined &&
          weightSt !== null &&
          weightLbs !== '' &&
          weightLbs !== undefined &&
          weightLbs !== null
        );
      }
    }
  };

  const handleNext = async () => {
    const fields =
      localStep === 1
        ? heightUnit === 'imperial'
          ? ['heightFt', 'heightIn']
          : ['heightCm']
        : weightUnit === 'imperial'
        ? ['weightSt', 'weightLbs']
        : ['weightKg'];

    // Validate
    const isValid = await trigger(fields);
    if (!isValid) return;

    // ⭐ Convert before going to next or calculating
    if (localStep === 1) {
      if (heightUnit === 'metrics') {
        // cm to ft/in
        const cm = parseFloat(watch('heightCm')) || 0;
        const totalInches = cm / 2.54;
        const ft = Math.floor(totalInches / 12);
        const inch = totalInches % 12;

        setValue('hiddenCm', cm);
        setValue('heightFt', ft ? Math.round(ft) : '');
        setValue('heightIn', inch ? Math.round(inch) : '');
      } else {
        // ft/in to cm
        const ft = parseFloat(watch('heightFt')) || 0;
        const inch = parseFloat(watch('heightIn')) || 0;
        const cm = ft * 30.48 + inch * 2.54;

        setValue('hiddenCm', cm);
        setValue('heightCm', cm ? Math.round(cm) : '');
      }
    } else {
      if (weightUnit === 'metrics') {
        // kg to st/lbs
        const kg = parseFloat(watch('weightKg')) || 0;
        const totalLbs = kg / 0.453592;
        const st = Math.floor(totalLbs / 14);
        const lbs = totalLbs % 14;

        setValue('hiddenKg', kg);
        setValue('weightSt', st ? Math.round(st) : '');
        setValue('weightLbs', lbs ? Math.round(lbs) : '');
      } else {
        // st/lbs to kg
        const st = parseFloat(watch('weightSt')) || 0;
        const lbs = parseFloat(watch('weightLbs')) || 0;
        const kg = st * 6.35029 + lbs * 0.453592;

        setValue('hiddenKg', kg);
        setValue('weightKg', kg ? Math.round(kg) : '');
      }
    }

    // After conversion → next step or calculate
    if (localStep === 2) {
      handleSubmit(async data => {
        const formValues = getValues();

        const ft = parseFloat(formValues.heightFt) || 0;
        const inch = parseFloat(formValues.heightIn) || 0;
        const cm = ft * 30.48 + inch * 2.54;

        const st = parseFloat(formValues.weightSt) || 0;
        const lbs = parseFloat(formValues.weightLbs) || 0;
        const kg = st * 6.35029 + lbs * 0.453592;

        const heightCm = parseFloat(data?.hiddenCm) || cm;
        const weightKg = parseFloat(data?.hiddenKg) || kg;

        const heightInMeters = heightCm / 100;

        let calculatedBmi = 0;
        let bmiLevel = '';

        if (heightInMeters > 0 && weightKg > 0) {
          calculatedBmi = weightKg / (heightInMeters * heightInMeters);
          calculatedBmi = +calculatedBmi.toFixed(1);

          if (calculatedBmi < 18.5) {
            bmiLevel = 'Underweight';
          } else if (calculatedBmi >= 18.5 && calculatedBmi < 25) {
            bmiLevel = 'Normal';
          } else if (calculatedBmi >= 25 && calculatedBmi < 30) {
            bmiLevel = 'Overweight';
          } else {
            bmiLevel = 'Obese';
          }
        }

        setBmi({
          ...bmi,
          ft: data?.heightFt,
          inch: data?.heightIn,
          cm: data?.heightCm,
          stones: data?.weightSt,
          pound: data?.weightLbs,
          kg: data?.weightKg,
          bmi: calculatedBmi,
          hiddenInch: data?.heightIn,
          hiddenLb: data?.weightLbs,
          hiddenCm: data?.hiddenCm || cm,
          hiddenKg: data?.hiddenKg || kg,
          height_unit: heightUnitKey || bmi?.height_unit, // default to metrics if blank
          weight_unit: weightUnitKey || bmi?.weight_unit, // default to metrics if blank
        });

        setShowLoader(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        navigation.navigate('bmi');
      })();
    } else {
      setLocalStep(2);
    }
  };

  // On Blur → Convert and sync hidden values
  const handleHeightBlur = () => {
    const ft = parseFloat(watch('heightFt')) || 0;
    const inch = parseFloat(watch('heightIn')) || 0;
    const cm = ft * 30.48 + inch * 2.54;

    setValue('hiddenCm', cm);
    setValue('heightCm', cm ? Math.round(cm) : '');
  };

  const handleCmBlur = () => {
    const cm = parseFloat(watch('heightCm')) || 0;
    console.log('handle CM Blur Working Here', cm);
    const totalInches = cm / 2.54;
    const ft = Math.floor(totalInches / 12);
    const inch = totalInches % 12;

    console.log('handle FTTTT Blur Working Here', ft);
    console.log('handle InCH Blur Working Here', inch);

    setValue('hiddenCm', cm);
    setValue('heightFt', ft ? Math.round(ft) : '');
    setValue('heightIn', inch ? Math.round(inch) : '');
  };

  const handleWeightBlur = () => {
    const st = parseFloat(watch('weightSt')) || 0;
    const lbs = parseFloat(watch('weightLbs')) || 0;
    const kg = st * 6.35029 + lbs * 0.453592;

    setValue('hiddenKg', kg);
    setValue('weightKg', kg ? Math.round(kg) : '');
  };

  const handleKgBlur = () => {
    const kg = parseFloat(watch('weightKg')) || 0;
    const totalLbs = kg / 0.453592;
    const st = Math.floor(totalLbs / 14);
    const lbs = totalLbs % 14;

    setValue('hiddenKg', kg);
    setValue('weightSt', st ? Math.round(st) : '');
    setValue('weightLbs', lbs ? Math.round(lbs) : '');
  };

  // const back = () => {
  //   if (reorderBackProcess == true) {
  //     navigation.navigate('re-order');
  //   } else {
  //     navigation.navigate('ethnicity');
  //   }
  // };

  const back = () => {
    if (reorderBackProcess == true) {
      navigation.navigate('re-order');
    } else if (isReturningPatient) {
      navigation.navigate('preferred-phone-number');
    } else {
      navigation.navigate('ethnicity');
    }
  };

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {paddingBottom: insets.bottom + 16},
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Progress bar */}
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: '70%'}]} />
          </View>

          {/* Card */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.progressLabel}>70% COMPLETED</Text>
              <Text style={styles.heading}>
                {localStep === 1
                  ? 'What is your height?'
                  : 'What is your current weight?'}
              </Text>
              <Text style={styles.description}>
                Your Body Mass Index (BMI) is an important factor in assessing
                your eligibility for treatment. Please enter your{' '}
                {localStep === 1 ? 'height' : 'weight'} below to allow us to
                calculate your BMI.
              </Text>
            </View>

            <View style={styles.cardBody}>
              {/* Unit Switch */}
              <SwitchTabs
                tabs={
                  localStep === 1
                    ? [
                        {label: 'cm', value: 'metrics'},
                        {label: 'ft/inch', value: 'imperial'},
                      ]
                    : [
                        {label: 'kg', value: 'metrics'},
                        {label: 'st/lb', value: 'imperial'},
                      ]
                }
                selectedTab={localStep === 1 ? heightUnit : weightUnit}
                onTabChange={value => {
                  if (localStep === 1) {
                    if (value === 'metrics') {
                      const ft = parseFloat(watch('heightFt')) || 0;
                      const inch = parseFloat(watch('heightIn')) || 0;
                      const cm = ft * 30.48 + inch * 2.54;

                      // console.log(ft);

                      console.log(
                        cm,
                        'cm value in tabs saving in hidden before round If metrics',
                      );
                      setValue('hiddenCm', cm);
                      setValue('heightCm', cm ? Math.round(cm) : '');
                    } else {
                      const cm = parseFloat(watch('heightCm')) || 0;
                      const totalInches = cm / 2.54;
                      const ft = Math.floor(totalInches / 12);
                      const inch = totalInches % 12;
                      console.log(
                        cm,
                        'cm value in tabs saving in hidden before round If imperial',
                      );
                      setValue('hiddenCm', cm);
                      setValue('heightFt', ft ? Math.round(ft) : '');
                      setValue('heightIn', inch ? Math.round(inch) : '');
                    }
                    setHeightUnit(value);
                    setHeightUnitKey(value);
                  } else {
                    if (value === 'metrics') {
                      const st = parseFloat(watch('weightSt')) || 0;
                      const lbs = parseFloat(watch('weightLbs')) || 0;
                      const kg = st * 6.35029 + lbs * 0.453592;
                      setValue('hiddenKg', kg);
                      setValue('weightKg', kg ? Math.round(kg) : '');
                    } else {
                      const kg = parseFloat(watch('weightKg')) || 0;
                      const totalLbs = kg / 0.453592;
                      const st = Math.floor(totalLbs / 14);
                      const lbs = totalLbs % 14;
                      setValue('hiddenKg', kg);
                      setValue('weightSt', st ? Math.round(st) : '');
                      setValue('weightLbs', lbs ? Math.round(lbs) : '');
                    }
                    setWeightUnit(value);
                    setWeightUnitKey(value);
                  }
                }}
              />

              {/* Input Fields */}
              <View>
                {localStep === 1 &&
                  (heightUnit === 'imperial' ? (
                    <View style={styles.row}>
                      <Controller
                        control={control}
                        name="heightFt"
                        rules={{
                          required: 'This field is required',
                          validate: value =>
                            validateRange(
                              value,
                              4,
                              10,
                              true,
                              'Only numbers from 4 to 10 are allowed',
                            ),
                        }}
                        render={({field: {onChange, onBlur, value}}) => (
                          <BmiTextField
                            required
                            label="Feet (ft)"
                            name="heightFt"
                            disabled={isReturningPatient}
                            readOnly={isReturningPatient}
                            style={{flex: 1}}
                            fieldProps={{
                              value:
                                value !== undefined && value !== null
                                  ? value.toString()
                                  : '',
                              onChangeText: val => {
                                onChange(val);
                                if (val !== '') setHeightUnitKey('imperial');
                              },
                              onEndEditing: () => {
                                onBlur(); // RHF internal blur
                                handleHeightBlur(); // Your custom conversion
                              },
                            }}
                            errors={errors}
                          />
                        )}
                      />
                      <Controller
                        control={control}
                        name="heightIn"
                        rules={{
                          required: 'This field is required',
                          validate: value =>
                            validateRange(
                              value,
                              0,
                              11,
                              true,
                              'Only valid numbers (0–11) are allowed',
                            ),
                        }}
                        render={({field: {onChange, onBlur, value}}) => (
                          <BmiTextField
                            required
                            label="Inches (in)"
                            name="heightIn"
                            disabled={isReturningPatient}
                            readOnly={isReturningPatient}
                            style={{flex: 1}}
                            fieldProps={{
                              value:
                                value !== undefined && value !== null
                                  ? value.toString()
                                  : '',
                              onChangeText: val => {
                                onChange(val);
                                if (val !== '') setHeightUnitKey('imperial');
                              },
                              onEndEditing: () => {
                                onBlur();
                                handleHeightBlur();
                              },
                            }}
                            errors={errors}
                          />
                        )}
                      />
                    </View>
                  ) : (
                    <Controller
                      control={control}
                      name="heightCm"
                      rules={{
                        required: 'This field is required',
                        validate: value => {
                          const num = Number(value);
                          if (!Number.isInteger(num))
                            return 'Only whole numbers from 122 to 300 are allowed';
                          if (num < 122 || num > 300)
                            return 'Only whole numbers from 122 to 300 are allowed';
                          return true;
                        },
                      }}
                      render={({field: {onChange, onBlur, value}}) => (
                        <BmiTextField
                          required
                          label="Centimetres (cm)"
                          disabled={isReturningPatient}
                          readOnly={isReturningPatient}
                          name="heightCm"
                          fieldProps={{
                            value:
                              value !== undefined && value !== null
                                ? value.toString()
                                : '',

                            // value,
                            onChangeText: val => {
                              onChange(val);
                              if (val !== '') setHeightUnitKey('metrics');
                            },
                            onBlur: () => {
                              onBlur();
                              handleCmBlur();
                            },
                          }}
                          errors={errors}
                        />
                      )}
                    />
                  ))}

                {localStep === 2 && (
                  <>
                    {weightUnit === 'imperial' ? (
                      <View style={styles.row}>
                        <Controller
                          control={control}
                          name="weightSt"
                          rules={{
                            required: 'This field is required',
                            validate: value =>
                              validateRange(
                                value,
                                4,
                                80,
                                false,
                                'Only valid numbers (4–80) are allowed',
                              ),
                          }}
                          render={({field: {onChange, onBlur, value}}) => (
                            <BmiTextField
                              required
                              label="Stone (st)"
                              name="weightSt"
                              style={{flex: 1}}
                              fieldProps={{
                                value:
                                  value !== undefined && value !== null
                                    ? value.toString()
                                    : '',
                                onChangeText: val => {
                                  onChange(val);
                                  if (val !== '') setWeightUnitKey('imperial');
                                },
                                onEndEditing: () => {
                                  onBlur(); // RHF's internal blur
                                  handleWeightBlur(); // Your custom conversion logic
                                },
                              }}
                              errors={errors}
                            />
                          )}
                        />
                        <Controller
                          control={control}
                          name="weightLbs"
                          rules={{
                            required: 'This field is required',
                            validate: value =>
                              validateRange(
                                value,
                                0,
                                20,
                                false,
                                'Only valid numbers (0–20) are allowed',
                              ),
                          }}
                          render={({field: {onChange, onBlur, value}}) => (
                            <BmiTextField
                              required
                              label="Pounds (lb)"
                              name="weightLbs"
                              style={{flex: 1}}
                              fieldProps={{
                                value:
                                  value !== undefined && value !== null
                                    ? value.toString()
                                    : '',
                                onChangeText: val => {
                                  onChange(val);
                                  if (val !== '') setWeightUnitKey('imperial');
                                },
                                onEndEditing: () => {
                                  onBlur();
                                  handleWeightBlur();
                                },
                              }}
                              errors={errors}
                            />
                          )}
                        />
                      </View>
                    ) : (
                      <Controller
                        control={control}
                        name="weightKg"
                        rules={{
                          required: 'This field is required',
                          validate: value =>
                            validateRange(
                              value,
                              40,
                              500,
                              true,
                              'Only whole numbers from 40 to 500 are allowed',
                            ),
                        }}
                        render={({field: {onChange, onBlur, value}}) => (
                          <BmiTextField
                            required
                            label="Kilograms (kg)"
                            name="weightKg"
                            fieldProps={{
                              value:
                                value !== undefined && value !== null
                                  ? value.toString()
                                  : '',
                              onChangeText: val => {
                                onChange(val);
                                if (val !== '') setWeightUnitKey('metrics');
                              },
                              onEndEditing: () => {
                                onBlur(); // RHF blur tracking
                                handleKgBlur(); // Your conversion to st/lbs
                              },
                            }}
                            errors={errors}
                          />
                        )}
                      />
                    )}

                    {lastBmi ? (
                      lastBmi?.weight_unit == 'metrics' ||
                      lastBmi?.weight_unit == 'metric' ? (
                        <View style={styles.infoBox}>
                          <View style={styles.infoRow}>
                            <Ionicons
                              name="information-circle"
                              size={20}
                              color="#856404"
                            />
                            <Text style={styles.infoText}>
                              Your previous recorded weight was{' '}
                              <Text style={styles.boldText}>
                                {lastBmi?.kg} kg
                              </Text>
                            </Text>
                          </View>
                        </View>
                      ) : (
                        <View style={styles.infoBox}>
                          <View style={styles.infoRow}>
                            <Ionicons
                              name="information-circle"
                              size={20}
                              color="#856404"
                            />
                            <Text style={styles.infoText}>
                              Your previous recorded weight was{' '}
                              <Text style={styles.boldText}>
                                {lastBmi?.stones} st & {lastBmi?.pound} lbs
                              </Text>
                            </Text>
                          </View>
                        </View>
                      )
                    ) : (
                      ''
                    )}
                  </>
                )}
              </View>

              <View style={styles.buttonWrap}>
                <NextButton
                  label="Next"
                  onPress={handleNext}
                  type="button"
                  disabled={!isStepValid()}
                  style={styles.submitButton}
                />
                {localStep === 2 ? (
                  <BackButton
                    type="button"
                    label="Back"
                    onPress={() => setLocalStep(1)}
                  />
                ) : (
                  <BackButton label="Back" onPress={back} />
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const PRIMARY = '#47317c';

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  container: {
    backgroundColor: '#FBFBFD',
    flexGrow: 1,
    padding: 16,
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
    paddingTop: 20,
    paddingBottom: 24,
  },

  row: {
    flexDirection: 'row',
    gap: 12,
  },

  buttonWrap: {
    marginTop: 6,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 48,
  },

  infoBox: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 6,
    borderRadius: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    color: '#92400e',
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    flex: 1,
    flexWrap: 'wrap',
    lineHeight: 18,
  },
  boldText: {
    fontFamily: Fonts.semiBold,
  },
});
