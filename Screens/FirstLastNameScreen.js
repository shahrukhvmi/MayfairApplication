import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import TextField from '../Components/TextFields';

export default function FirstLastNameScreen() {
  const navigation = useNavigation();

  // ✅ Initialize react-hook-form
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
    },
    mode: 'onChange',
  });

  // ✅ On Submit
  const onSubmit = (data) => {
    console.log('Form Data:', data);
    navigation.navigate('email-confirmation', { ...data });
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        {/* Top Progress */}
        <View style={styles.progressBarContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>10% Completed</Text>

        {/* Heading */}
        <Text style={styles.heading}>Enter your full legal name</Text>
        <Text style={styles.subtext}>
          We require this to generate your prescription if you qualify for the treatment.
        </Text>

        {/* First Name */}
        <Controller
          control={control}
          name="firstName"
          rules={{ required: 'First name is required' }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="First Name"
              placeholder="Enter first name"
              value={value}
              onChangeText={onChange}
              required
            />
          )}
        />
        {errors.firstName && (
          <Text style={styles.error}>{errors.firstName.message}</Text>
        )}

        {/* Last Name */}
        <Controller
          control={control}
          name="lastName"
          rules={{ required: 'Last name is required' }}
          render={({ field: { onChange, value } }) => (
            <TextField
              label="Last Name"
              placeholder="Enter last name"
              value={value}
              onChangeText={onChange}
              required
            />
          )}
        />
        {errors.lastName && (
          <Text style={styles.error}>{errors.lastName.message}</Text>
        )}

        {/* Next Button */}
        <NextButton
          label="Next"
          loading={false}
          disabled={!isValid}
          onPress={handleSubmit(onSubmit)}
        />

        <BackButton

          label="Back"
          onPress={() => navigation.goBack()}
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
    width: '10%',
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
        fontSize: 26,
        fontWeight: '600',
        color: '#2e2e2e',
        fontWeight: 'bold',
        fontFamily: 'serif',
        marginBottom: 6,
    },
  subtext: {
    color: '#555',
    fontSize: 14,
    marginBottom: 30,
  },
  error: {
    color: 'red',
    marginBottom: 10,
  },
});
