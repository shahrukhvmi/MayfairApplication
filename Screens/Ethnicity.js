import {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useForm, Controller} from 'react-hook-form';

import usePatientInfoStore from '../store/patientInfoStore';

export default function Ethnicity() {
  const navigation = useNavigation();
  const {patientInfo, setPatientInfo} = usePatientInfoStore();

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: {isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      ethnicity: '',
    },
  });

  const selection = watch('ethnicity');

  useEffect(() => {
    if (patientInfo?.ethnicity) {
      const fixedEthnicity =
        patientInfo.ethnicity.charAt(0).toUpperCase() +
        patientInfo.ethnicity.slice(1).toLowerCase();

      setValue('ethnicity', fixedEthnicity);
      trigger(['ethnicity']);
    }
  }, [patientInfo]);

  const options = ['Yes', 'No', 'Prefer not to say'];

  const onSubmit = data => {
    setPatientInfo({
      ...patientInfo,
      ethnicity: data.ethnicity,
    });
    navigation.navigate('calculate-bmi');
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>60% Completed</Text>

        {/* Heading */}
        <Text style={styles.heading}>Confirm Ethnicity</Text>
        <Text style={styles.subText}>
          People of certain ethnicities may be suitable for treatment at a lower
          BMI than others, if appropriate.
        </Text>

        <Text style={styles.question}>
          Does one of the following options describe your ethnic group or
          background?
        </Text>

        {/* Ethnicity List */}
        <View style={styles.ethnicityList}>
          <View style={styles.column}>
            <Text style={styles.bullet}>• South Asian</Text>
            <Text style={styles.bullet}>• Other Asian</Text>
            <Text style={styles.bullet}>• Black African</Text>
          </View>
          <View style={styles.column}>
            <Text style={styles.bullet}>• Chinese</Text>
            <Text style={styles.bullet}>• Middle Eastern</Text>
            <Text style={styles.bullet}>• African-Caribbean</Text>
          </View>
        </View>

        {/* Selection Options */}
        <Controller
          control={control}
          name="ethnicity"
          rules={{required: true}}
          render={({field: {value, onChange}}) => (
            <>
              {options.map(opt => (
                <TouchableOpacity
                  key={opt}
                  style={[
                    styles.optionBox,
                    value === opt && styles.selectedBox,
                  ]}
                  onPress={() => onChange(opt)}>
                  <View style={styles.optionContent}>
                    <Ionicons
                      name={
                        value === opt ? 'checkmark-circle' : 'ellipse-outline'
                      }
                      size={20}
                      color={value === opt ? '#4B0082' : '#999'}
                      style={{marginRight: 4}}
                    />
                    <Text style={styles.optionText}>{opt}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
        />

        {/* Buttons */}
        <NextButton
          label="Next"
          onPress={handleSubmit(onSubmit)}
          disabled={!isValid}
        />
        <BackButton label="Back" onPress={() => navigation.goBack()} />
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
    width: '60%',
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
    marginBottom: 15,
  },
  question: {
    fontWeight: '600',
    marginBottom: 10,
    fontSize: 15,
  },
  ethnicityList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  column: {
    flex: 1,
  },
  bullet: {
    fontSize: 14,
    marginBottom: 5,
  },
  optionBox: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    backgroundColor: '#fff',
  },
  selectedBox: {
    borderColor: '#4B0082',
    backgroundColor: '#eee6ff',
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    fontSize: 15,
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
});
