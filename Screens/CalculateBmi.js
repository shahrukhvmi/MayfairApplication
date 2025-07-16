import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import {
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
    console.log(bmi, 'This is bmi');

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
        return !errors.heightFt && !errors.heightIn;
      } else {
        return !errors.heightCm;
      }
    } else {
      if (weightUnit === 'metrics') {
        return !errors.weightKg;
      } else {
        return !errors.weightSt && !errors.weightLbs;
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

  const back = () => {
    if (reorderBackProcess == true) {
      navigation.navigate('re-order');
    } else {
      navigation.navigate('ethnicity');
    }
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>70% Completed</Text>

        {/* Title */}
        <Text style={styles.heading}>What is your height?</Text>
        <Text style={styles.subText}>
          Your Body Mass Index (BMI) is an important factor in assessing your
          eligibility for treatment. Please enter your height below to allow us
          to calculate your BMI.
        </Text>

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
              <View className="grid grid-cols-2 gap-4">
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
                <View className="grid grid-cols-2 gap-4">
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
                        <Text style={styles.boldText}>{lastBmi?.kg} kg</Text>
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

        <NextButton
          label="Next"
          onPress={handleNext}
          type="button"
          disabled={!isStepValid()}
        />
        {localStep === 2 ? (
          <BackButton
            type="button"
            label="Back"
            className="mt-3"
            onPress={() => setLocalStep(1)}
          />
        ) : (
          <BackButton label="Back" className="mt-2" onPress={back} />
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f5ff',
    flexGrow: 1,
    padding: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    width: '70%',
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
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  unitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f8f5ff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  unitButton: {
    flex: 1,
    backgroundColor: 'lightgray',
    padding: 12,
    alignItems: 'center',
  },
  unitSelected: {
    backgroundColor: '#36235C',
    borderColor: '#4B0082',
    color: '#fff',
    padding: 12,
  },
  unitText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  nextButton: {
    backgroundColor: '#4B0082',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
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
    marginTop: 18,
    color: '#4B0082',
    textDecorationLine: 'underline',
  },
  infoBox: {
    backgroundColor: '#FFF3CD',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 0,
    marginBottom: 24,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    color: '#333',
    fontSize: 14,
    flex: 1,
    flexWrap: 'wrap',
  },
  boldText: {
    fontWeight: 'bold',
  },
});
