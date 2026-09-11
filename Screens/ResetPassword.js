import React, {useEffect, useState} from 'react';
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
  ActivityIndicator,
} from 'react-native';
import {useRoute, useNavigation} from '@react-navigation/native';
import {Controller, useForm} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {logApiSuccess, logApiError} from '../utils/logApiDebug';
import {forgotPassword} from '../api/ChangePasswordApi';
import Header from '../Layout/header';
import TextFields from '../Components/TextFields';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const ResetPassword = () => {
  const route = useRoute();
  const {token, email} = route.params || {};
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: {errors},
  } = useForm();

  const forgotPasswordMutation = useMutation(forgotPassword, {
    onSuccess: data => {
      logApiSuccess(data);
      Toast.show({
        type: 'success',
        text1: 'Password Updated Successfully',
        text2: 'You can now log in with your new password.',
      });
      navigation.navigate('Login');
      setLoading(false);
    },
    onError: error => {
      logApiError(error);
      Toast.show({
        type: 'error',
        text1: 'Something went wrong. Please try again later.',
      });
      setLoading(false);
    },
  });

  useEffect(() => {
    if (token) console.log('Token from URL:', token);
  }, [token]);

  const onSubmit = data => {
    const formData = {
      email,
      token,
      password: data.password,
      password_confirmation: data.confirmPassword,
      company_id: 1,
    };
    setLoading(true);
    forgotPasswordMutation.mutate(formData);
  };

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const isDisabled = !password || !confirmPassword || loading;

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
              <Text style={styles.heading}>Reset Password</Text>
              <Text style={styles.description}>
                Create a new password for your account.
              </Text>

              <Controller
                control={control}
                name="password"
                rules={{required: 'Password is required'}}
                render={({field: {onChange, value}}) => (
                  <TextFields
                    label="New Password"
                    placeholder="Enter new password"
                    type="password"
                    required
                    value={value}
                    onChangeText={onChange}
                    disablePaste
                  />
                )}
              />
              {errors.password && (
                <Text style={styles.errorText}>{errors.password.message}</Text>
              )}

              <Controller
                control={control}
                name="confirmPassword"
                rules={{
                  required: 'Confirm your password',
                  validate: val =>
                    val === watch('password') || "Passwords don't match",
                }}
                render={({field: {onChange, value}}) => (
                  <TextFields
                    label="Confirm Password"
                    placeholder="Re-enter new password"
                    type="password"
                    required
                    value={value}
                    onChangeText={onChange}
                    disablePaste
                  />
                )}
              />
              {errors.confirmPassword && (
                <Text style={styles.errorText}>
                  {errors.confirmPassword.message}
                </Text>
              )}

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
                    <Text style={styles.btnText}> Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Submit</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.footer}>
                Already have an account?{' '}
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

export default ResetPassword;

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
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: -10,
    marginBottom: 12,
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
