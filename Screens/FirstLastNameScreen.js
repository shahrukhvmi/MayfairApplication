import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import useSignupStore from '../store/signupStore';
import useAuthStore from '../store/authStore';
import PageLoader from '../Components/PageLoader';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import TextFields from '../Components/TextFields';
import Header from '../Layout/header';

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [showLoader, setShowLoader] = useState(false);

  const { token } = useAuthStore();
  const { firstName, lastName, setFirstName, setLastName } = useSignupStore();

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  useEffect(() => {
    setValue('firstName', firstName);
    setValue('lastName', lastName);

    if (firstName || lastName) {
      trigger(['firstName', 'lastName']);
    }
  }, [firstName, lastName, setValue, trigger]);

  const onSubmit = async (data) => {
    setFirstName(data.firstName);
    setLastName(data.lastName);

    setShowLoader(true);
    await new Promise((res) => setTimeout(res, 500));

    setShowLoader(false); // ✅ reset loader before navigating
    navigation.navigate('email-confirmation');
  };


  return (
    <>
      <Header />

      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.container}>
          <Text style={styles.heading}>Enter your full legal name</Text>
          <Text style={styles.description}>
            We require this to generate your prescription if you qualify for the treatment.
          </Text>

          <View style={[styles.form, showLoader && { opacity: 0.5 }]}>
            <TextFields
              label="First Name"
              name="firstName"
              placeholder="First Name"
              register={register}
              errors={errors}
              required
            />
            <TextFields
              label="Last Name"
              name="lastName"
              placeholder="Last Name"
              register={register}
              errors={errors}
              required
            />

            <NextButton
              label="Next"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid}
            />

            <BackButton
              label="Back"
              onPress={() => navigation.navigate('Acknowledgment')}
              style={styles.backButton}
            />
          </View>

          {showLoader && (
            <View style={styles.loaderOverlay}>
              <PageLoader />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555',
    marginBottom: 20,
  },
  form: {
    gap: 16,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    marginTop: 16,
  },
});
