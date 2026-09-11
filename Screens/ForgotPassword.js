import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

import {forgotPasswordLink} from '../api/forgotPasswordLinkApi';
import {passwordlink} from '../config/constants';
import Header from '../Layout/header';
import TextFields from '../Components/TextFields';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const ForgotPasswordScreen = () => {
  const {control, handleSubmit, watch} = useForm();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const submittedEmail = watch('email');

  const forgotLinkMutation = useMutation(forgotPasswordLink);

  useEffect(() => {
    if (isSuccess && resendTimer === 0) {
      setResendTimer(30);
    }
  }, [isSuccess]);

  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const onSubmit = data => {
    setLoading(true);
    forgotLinkMutation.mutate(
      {email: data.email, passwordlink, clinic_id: 1},
      {
        onSuccess: () => {
          setIsSuccess(true);
          Toast.show({
            type: 'success',
            text1: 'Success',
            text2: 'Reset link sent to your email.',
          });
        },
        onError: error => {
          setLoading(false);
          const errors = error?.response?.data?.errors;
          const emailError = errors?.email;
          if (emailError) {
            Toast.show({type: 'error', text1: 'Error', text2: emailError});
          }
          if (errors) {
            Object.values(errors)
              .flat()
              .forEach(msg =>
                Toast.show({type: 'error', text1: 'Error', text2: msg}),
              );
          } else {
            Toast.show({
              type: 'error',
              text1: 'Error',
              text2: 'Something went wrong.',
            });
          }
        },
        onSettled: () => setLoading(false),
      },
    );
  };

  const handleResend = () => {
    if (!submittedEmail) {
      Toast.show({type: 'error', text1: 'Error', text2: 'Email is missing.'});
      return;
    }
    setResendLoading(true);
    forgotLinkMutation.mutate(
      {email: submittedEmail, passwordlink, clinic_id: 1},
      {
        onSuccess: () => {
          Toast.show({
            type: 'success',
            text1: 'Link Resent',
            text2: 'Password reset link has been resent.',
          });
          setResendTimer(30);
        },
        onError: () => {
          Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Unable to resend reset link.',
          });
        },
        onSettled: () => setResendLoading(false),
      },
    );
  };

  const email = watch('email');
  const isDisabled = !email || loading;

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        style={{flex: 1, backgroundColor: '#FBFBFD'}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={styles.screen}
            contentContainerStyle={[
              styles.container,
              {paddingBottom: insets.bottom + 24},
            ]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.heading}>Forgot Password</Text>
              <Text style={styles.description}>
                Enter your email and we'll send you a link to reset your
                password.
              </Text>

              {!isSuccess ? (
                <>
                  <Controller
                    control={control}
                    name="email"
                    rules={{required: true}}
                    render={({field: {onChange, value}}) => (
                      <TextFields
                        label="Email Address"
                        placeholder="name@example.com"
                        required
                        value={value}
                        onChangeText={onChange}
                        disabled={loading}
                      />
                    )}
                  />

                  <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    disabled={isDisabled}
                    activeOpacity={0.85}
                    style={[
                      styles.btn,
                      isDisabled ? styles.btnDisabled : styles.btnEnabled,
                    ]}>
                    {loading ? (
                      <View style={styles.loadingContent}>
                        <ActivityIndicator color="#fff" />
                        <Text style={styles.btnText}> Sending...</Text>
                      </View>
                    ) : (
                      <Text style={styles.btnText}>Send Reset Link</Text>
                    )}
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.successBox}>
                    <Feather name="check-circle" size={18} color="#059669" />
                    <Text style={styles.successText}>
                      A password reset link has been sent to your email address.
                    </Text>
                  </View>
                  <Text style={styles.spamText}>
                    Didn't receive the email? Check your spam or junk folder.
                  </Text>

                  <TouchableOpacity
                    onPress={handleResend}
                    disabled={resendLoading || resendTimer > 0}
                    activeOpacity={0.85}
                    style={[
                      styles.btn,
                      resendLoading || resendTimer > 0
                        ? styles.btnDisabled
                        : styles.btnEnabled,
                    ]}>
                    {resendLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.btnText}>
                        {resendTimer > 0
                          ? `Resend Link (${resendTimer}s)`
                          : 'Resend Password Reset Link'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              <Text style={styles.footer}>
                Remember your password?{' '}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Login')}>
                  Login
                </Text>
              </Text>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default ForgotPasswordScreen;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    padding: 20,
    shadowColor: 'rgba(71, 49, 124, 0.09)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginBottom: 22,
    lineHeight: 20,
  },
  btn: {
    marginTop: 6,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEnabled: {
    backgroundColor: PRIMARY,
  },
  btnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  btnText: {
    color: '#fff',
    fontSize: 15,
    fontFamily: Fonts.semiBold,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  successText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#047857',
    lineHeight: 19,
  },
  spamText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginBottom: 18,
    lineHeight: 18,
  },
  footer: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#334155',
    textAlign: 'center',
    marginTop: 20,
  },
  link: {
    color: PRIMARY,
    fontFamily: Fonts.semiBold,
    textDecorationLine: 'underline',
  },
});
