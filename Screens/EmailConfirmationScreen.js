// 📦 Required imports
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// 🛒 Stores
import useSignupStore from '../store/signupStore';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';

// 📦 API
import { registerUser } from '../api/authApi';
import loginApi from '../api/loginApi';

// 🧱 Components
import TextFields from '../Components/TextFields';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import PageLoader from '../Components/PageLoader';
import LoginModal from '../Components/Login/LoginModal';
import Header from '../Layout/header';
import useLoginModalStore from '../store/useLoginModalStore';
import useUserDataStore from '../store/userDataStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import Fetcher from '../library/Fetcher';

const EmailConfirmationScreen = () => {
  const navigation = useNavigation();
  const [showLoader, setShowLoader] = useState(false);
  const [already, setAlready] = useState(false);
  //   console.log(already, 'already');
  const {
    firstName,
    lastName,
    setFirstName,
    setLastName,
    email,
    confirmationEmail,
    setEmail,
    setConfirmationEmail,
  } = useSignupStore();

  const { setUserData } = useUserDataStore();
  const { token, setToken } = useAuthStore();
  const { setIsPasswordReset, setShowResetPassword } = usePasswordReset();
  const { setAuthUserDetail } = useAuthUserDetailStore();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors, isValid },
  } = useForm({
    mode: 'onChange',
    defaultValues: { email: '', confirmationEmail: '' },
  });
  const { showLoginModal, closeLoginModal, openLoginModal } =
    useLoginModalStore();
  useEffect(() => {
    setValue('email', email);
    setValue('confirmationEmail', confirmationEmail);
    if (email) trigger(['email', 'confirmationEmail']);
  }, [email, confirmationEmail]);

  //   const registerMutation = useMutation(registerUser, {
  //     onSuccess: data => {
  //       const user = data?.data?.data;
  //       setAuthUserDetail(user);
  //       setUserData(user);
  //       setToken(user?.token);
  //       setIsPasswordReset(true);
  //       Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;
  //       navigation.navigate('steps-information');
  //     },
  //     onError: error => {
  //       const emailError = error?.response?.data?.errors?.email;
  //       if (emailError === 'This email is already registered.') setAlready(true);
  //       setShowLoader(false);
  //     },
  //   });

  //   const loginMutation = useMutation({
  //     mutationFn: loginApi,
  //     onMutate: () => setShowLoader(true),
  //     onSuccess: resp => {
  //       const user = resp?.data?.data;
  //       if (!user?.token) throw new Error('No token in response');

  //       setToken(user.token);
  //       Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
  //       setShowLoader(false);
  //       closeLoginModal();

  //       setFirstName(user.fname);
  //       setLastName(user.lname);
  //       setEmail(user.email);

  //       navigation.reset({
  //         index: 0,
  //         routes: [{name: 'dashboard'}],
  //       });
  //     },
  //     onError: error => {
  //       setShowLoader(false);
  //       const errs = error?.response?.data?.errors;
  //       if (errs && typeof errs === 'object') {
  //         Object.values(errs)
  //           .flat()
  //           .forEach(msg => Toast.show({type: 'error', text1: msg}));
  //       } else {
  //         Toast.show({type: 'error', text1: 'Login failed'});
  //       }
  //     },
  //   });

  const onSubmit = data => {
    console.log(data, 'Form Data');
    setEmail(data.email);
    setConfirmationEmail(data.confirmationEmail);
    setShowLoader(true);

    // registerMutation.mutate({
    //   email: data.email,
    //   email_confirmation: data.confirmationEmail,
    //   fname: firstName,
    //   lname: lastName,
    //   company_id: 1,
    // });

    setShowLoader(false);
    navigation.navigate('personal-details');
  };

  return (
    <>
      <Header />

      <KeyboardAvoidingView
        style={styles.wrapper}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.container}>
          <Text style={styles.heading}>Enter your email address</Text>
          <Text style={styles.description}>
            This is where we will send information about your order.
          </Text>

          <View style={[styles.form, showLoader && { opacity: 0.5 }]}>
            <Controller
              control={control}
              name="email"
              rules={{ required: 'Email is required' }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextFields
                  label="Email Address"
                  placeholder="Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            <Controller
              control={control}
              name="confirmationEmail"
              rules={{
                required: 'Confirm email is required',
                validate: value =>
                  value === getValues('email') || 'Emails must match',
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextFields
                  label="Confirm Email Address"
                  placeholder="Confirm Email Address"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            {already && (
              <Text style={styles.alreadyText}>
                This email is already taken.{' '}
                <Text onPress={() => openLoginModal()} style={styles.loginLink}>
                  Click here to login.
                </Text>
              </Text>
            )}


          </View>
          <NextButton
            label="Next"
            onPress={() => navigation.navigate('personal-details')}
            // onPress={handleSubmit(onSubmit)}
            // disabled={!isValid}
          />

          <BackButton
            label="Back"
            onPress={() => navigation.navigate('signup')}

          />
          {showLoader && (
            <View style={styles.loaderOverlay}>
              <PageLoader />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>

      {/* Login Modal */}
      <LoginModal
        modes="login"
        show={showLoginModal}
        onClose={closeLoginModal}
        isLoading={showLoader}
        onLogin={formData => loginMutation.mutate({ ...formData, company_id: 1 })}
      />
    </>
  );
};

export default EmailConfirmationScreen;

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
  heading: { fontSize: 22, fontWeight: 'bold', color: '#111', marginBottom: 10 },
  description: { fontSize: 14, color: '#555', marginBottom: 20 },
  form: { gap: 10 },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alreadyText: {
    color: 'red',
    fontSize: 13,
    marginBottom: 10,
  },
  loginLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
    fontWeight: '600',
  },
});
