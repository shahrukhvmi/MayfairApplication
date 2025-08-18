import Ionicons from 'react-native-vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import {useState, useEffect} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useForm, Controller} from 'react-hook-form';
import {differenceInYears, parse, format} from 'date-fns';

import usePatientInfoStore from '../store/patientInfoStore'; // <-- import your Zustand store
import useProductId from '../store/useProductIdStore';

import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';

export default function PersonalDetails() {
  const navigation = useNavigation();

  // Zustand store
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
    const age = differenceInYears(new Date(), date);
    if (age < 18) return 'You must be at least 18 years old';
    if (productId === 1 && age > 75)
      return 'Wegovy is not recommended above 75';
    if (productId === 4 && age > 85)
      return 'Mounjaro is not recommended above 85';
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

  const formatDate = date => {
    return date.toLocaleDateString('en-GB');
  };

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

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>30% Completed</Text>

        <Text style={styles.heading}>Mention your sex at birth</Text>
        <Text style={styles.subtext}>
          This refers to your sex when you were born. We ask this because a
          range of health issues are specific to people based on their sex at
          birth.
        </Text>

        {/* Gender Options */}
        <View style={{flexDirection: 'row', gap: 10}}>
          {['Male', 'Female'].map(option => (
            <TouchableOpacity
              key={option}
              style={[
                styles.optionButton,
                gender === option && styles.optionButtonSelected,
              ]}
              onPress={() => setValue('gender', option)}>
              <Ionicons
                name={gender === option ? 'checkbox' : 'square-outline'}
                size={20}
                color="#4B0082"
                style={{marginRight: 8}}
              />
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pregnancy Section */}
        {gender === 'Female' && (
          <>
            <Text style={{fontWeight: 'bold', marginVertical: 16}}>
              Are you pregnant, breastfeeding, or trying to conceive?
            </Text>

            <Controller
              control={control}
              name="pregnancy"
              rules={{
                required:
                  gender === 'Female' ? 'Please select an option' : false,
              }}
              render={({field: {onChange, value}}) => (
                <>
                  <View style={{flexDirection: 'row', gap: 10}}>
                    {['Yes', 'No'].map(option => {
                      const isDisabled = gender !== 'Female';
                      return (
                        <TouchableOpacity
                          key={option}
                          style={[
                            styles.optionButton,
                            value === option && styles.optionButtonSelected,
                            isDisabled && {opacity: 0.5},
                          ]}
                          onPress={() => {
                            if (!isDisabled) onChange(option);
                          }}
                          disabled={isDisabled}>
                          <Ionicons
                            name={
                              value === option ? 'checkbox' : 'square-outline'
                            }
                            size={20}
                            color="#4B0082"
                            style={{marginRight: 8}}
                          />
                          <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {value === 'Yes' && gender === 'Female' && (
                    <Text style={{color: 'red', marginTop: 10}}>
                      This treatment is not suitable if you're pregnant, trying
                      to get pregnant or breastfeeding.
                    </Text>
                  )}
                </>
              )}
            />

            {errors?.pregnancy && (
              <Text style={{color: 'red'}}>{errors.pregnancy.message}</Text>
            )}
          </>
        )}

        {/* Date of Birth */}
        <Text style={styles.label}>Date of Birth</Text>

        <Controller
          control={control}
          name="dob"
          rules={{validate: validateAge}}
          render={({field: {value, onChange}}) => (
            <>
              <TouchableOpacity
                style={styles.dobInput}
                onPress={() => setShowPicker(true)}>
                <Text
                  style={{
                    fontSize: 16,
                    color: '#000',
                  }}>
                  {value ? formatDate(value) : 'Select your date of birth'}
                </Text>
                <Ionicons name="calendar" size={20} color="#444" />
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
          <Text style={{color: 'red', marginTop: 1}}>{errors.dob.message}</Text>
        )}

        {/* Buttons */}
        <NextButton
          style={{marginTop: 30}}
          label="Next"
          disabled={
            !isValid ||
            gender === '' ||
            (gender === 'Female' && !watch('pregnancy')) ||
            (gender === 'Female' && watch('pregnancy') === 'Yes')
          }
          onPress={handleSubmit(onSubmit)}
        />

        <BackButton
          label="Back"
          onPress={() => navigation.navigate('signup')}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f7f4ff',
    flexGrow: 1,
  },
  progressBarContainer: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 8,
  },

  progressBar: {
    width: '30%',
    height: '100%',
    backgroundColor: '#4B0082',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#555',
    marginBottom: 20,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'serif',
    color: '#222',
    marginBottom: 10,
  },
  subtext: {
    color: '#555',
    fontSize: 14,
    marginBottom: 30,
  },
  genderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  genderSelected: {
    borderColor: '#4B0082',
    backgroundColor: '#f2e9ff',
  },
  genderText: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#333',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 6,
    marginTop: 10,
    color: '#333',
  },
  dobInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginBottom: 5,
    color: '#000000',
  },
  optionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  optionButtonSelected: {
    borderColor: '#4B0082',
    backgroundColor: '#f0e6ff',
  },

  optionText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
});
