import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';

import {useEffect} from 'react';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import Fetcher from '../library/Fetcher';
import RegisterApi from '../api/RegisterApi';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import usePasswordReset from '../store/usePasswordReset';
import useAuthStore from '../store/authStore';
import useUserDataStore from '../store/userDataStore';
import usePlayerStore from '../store/usePlayerStore';
import {logApiError, logApiSuccess} from '../utils/logApiDebug';
import Toast from 'react-native-toast-message';
import useSignupStore from '../store/signupStore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '../Layout/header';
import TextFields from '../Components/TextFields';
import NextButton from '../Components/NextButton';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 20;

const RegisterScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    control,
    handleSubmit,
    watch,
    formState: {},
  } = useForm();
  const [loading, setLoading] = useState(false);
  const [already, setAlready] = useState(false);

  const {setAuthUserDetail} = useAuthUserDetailStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {token, setToken} = useAuthStore();
  const {setUserData} = useUserDataStore();
  const {playerId} = usePlayerStore();
  const {setEmail} = useSignupStore();

  // Once registered (token set), protected screens mount — go to dashboard.
  useEffect(() => {
    if (token) {
      navigation.reset({index: 0, routes: [{name: 'dashboard'}]});
    }
  }, [token]);

  const registerMutation = useMutation(RegisterApi, {
    onSuccess: data => {
      logApiSuccess(data);
      const user = data?.data?.data;

      if (user?.token) {
        setAuthUserDetail(user);
        setUserData(user);
        setIsPasswordReset(true);
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;
        // Set token last; the token-driven effect lands the user on dashboard
        // once the protected screens have mounted (avoids a mount race).
        setToken(user?.token);
      }

      setLoading(false);
    },
    onError: error => {
      logApiError(error);
      const emailError = error?.response?.data?.errors?.email;

      if (emailError === 'This email is already registered.') setAlready(true);

      Toast.show({
        type: 'error',
        text1: emailError ? 'Email Error' : 'Registration Failed',
        text2: emailError || 'Something went wrong. Please try again later.',
      });

      setLoading(false);
    },
  });

  const onSubmit = data => {
    setEmail(data?.email);
    setAlready(false);

    const formData = {
      email: data.email,
      email_confirmation: data.confirmationEmail,
      password: data.password,
      confirm_password: data.confirmPassword,
      company_id: 1,
      player_id: playerId,
    };
    setLoading(true);
    registerMutation.mutate(formData);
  };

  const handlePaste = e => {
    e.preventDefault();
    Alert.alert('Copy-pasting is disabled');
  };

  const email = watch('email');
  const confirmationEmail = watch('confirmationEmail');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const isDisabled =
    !email || !confirmationEmail || !password || !confirmPassword || loading;

  return (
    <>
      <Header />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
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
                <Text style={styles.progressLabel}>
                  {PERCENTAGE}% COMPLETED
                </Text>
                <Text style={styles.heading}>Enter your email address</Text>
                <Text style={styles.description}>
                  This is where we will send information about your order.
                </Text>
              </View>

              <View style={styles.cardBody}>
                <Controller
                  control={control}
                  name="email"
                  rules={{
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email format',
                    },
                  }}
                  render={({field: {onChange, value}}) => (
                    <TextFields
                      label="Email Address"
                      placeholder="name@example.com"
                      value={value}
                      onChangeText={onChange}
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmationEmail"
                  rules={{
                    required: 'Confirm Email is required',
                    validate: value =>
                      value === email || 'Emails do not match',
                  }}
                  render={({field: {onChange, value}}) => (
                    <TextFields
                      label="Confirm Email Address"
                      placeholder="Re-enter your email address"
                      value={value}
                      onChangeText={onChange}
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: {value: 6, message: 'Minimum 6 characters'},
                  }}
                  render={({field: {onChange, value}}) => (
                    <TextFields
                      label="Password"
                      type="password"
                      placeholder="Create a password"
                      value={value}
                      onChangeText={onChange}
                      required
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Confirm your password',
                    validate: val =>
                      val === password || "Passwords don't match",
                  }}
                  render={({field: {onChange, value}}) => (
                    <TextFields
                      label="Confirm Password"
                      type="password"
                      placeholder="Re-enter your password"
                      value={value}
                      onChangeText={onChange}
                      required
                    />
                  )}
                />

                {already && (
                  <View style={styles.warningBox}>
                    <Text style={styles.warningText}>
                      The email address you have entered is already
                      associated with an existing account.{' '}
                      <Text
                        style={styles.warningLink}
                        onPress={() => navigation.navigate('Login')}>
                        Click here to login.
                      </Text>
                    </Text>
                  </View>
                )}

                <View style={styles.buttonWrap}>
                  <NextButton
                    label={loading ? 'Registering...' : 'Next'}
                    onPress={handleSubmit(onSubmit)}
                    disabled={isDisabled}
                    loading={loading}
                    style={styles.submitButton}
                  />
                </View>

                <View style={styles.endView}>
                  <Text style={styles.endTxt}>Already have an account?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.loginTxt}>Login</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
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

  // Warning
  warningBox: {
    marginTop: 4,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  warningText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#dc2626',
    lineHeight: 18,
  },
  warningLink: {
    fontFamily: Fonts.medium,
    color: PRIMARY,
    textDecorationLine: 'underline',
  },

  buttonWrap: {
    marginTop: 6,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },

  endView: {
    flexDirection: 'row',
    marginTop: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  endTxt: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#64748b',
  },
  loginTxt: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },
});

export default RegisterScreen;
