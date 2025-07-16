import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import Fetcher from '../library/Fetcher';
import RegisterApi from '../api/RegisterApi';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import usePasswordReset from '../store/usePasswordReset';
import useAuthStore from '../store/authStore';
import useUserDataStore from '../store/userDataStore';
import { logApiError, logApiSuccess } from '../utils/logApiDebug';
import Toast from 'react-native-toast-message';

const RegisterScreen = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, watch, formState: { errors } } = useForm();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [already, setAlready] = useState(false);

  const { setAuthUserDetail } = useAuthUserDetailStore();
  const { setIsPasswordReset } = usePasswordReset();
  const { setToken } = useAuthStore();
  const { setUserData } = useUserDataStore();

  const registerMutation = useMutation(RegisterApi, {
    onSuccess: (data) => {
      logApiSuccess(data);
      const user = data?.data?.data;

      if (user?.token) {
        setAuthUserDetail(user);
        setUserData(user);
        setToken(user?.token);
        setIsPasswordReset(true);
        Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user?.token}`;
        navigation.reset({ index: 0, routes: [{ name: 'dashboard' }] });
      }

      setLoading(false);
    },
    onError: (error) => {
      logApiError(error);
      const emailError = error?.response?.data?.errors?.email;

      if (emailError === "This email is already registered.") setAlready(true);

      Toast.show({
        type: 'error',
        text1: emailError ? 'Email Error' : 'Registration Failed',
        text2: emailError || 'Something went wrong. Please try again later.',
      });

      setLoading(false);
    }
  });

  const onSubmit = (data) => {
    const formData = {
      email: data.email,
      email_confirmation: data.confirmationEmail,
      password: data.password,
      confirm_password: data.confirmPassword,
      company_id: 1,
    };
    setLoading(true);
    registerMutation.mutate(formData);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    Alert.alert('Copy-pasting is disabled');
  };

  const email = watch('email');
  const confirmationEmail = watch('confirmationEmail');
  const password = watch('password');
  const confirmPassword = watch('confirmPassword');
  const isDisabled = !email || !confirmationEmail || !password || !confirmPassword || loading;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/logo-white.png')} style={styles.image} />
            </View>

            <View style={styles.subView}>
              <Text style={styles.subTxt}>Register</Text>

              {/* Email */}
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
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Email"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                    onPaste={handlePaste}
                  />
                )}
              />
              {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}

              {/* Confirm Email */}
              <Controller
                control={control}
                name="confirmationEmail"
                rules={{
                  required: 'Confirm Email is required',
                  validate: value => value === email || 'Emails do not match',
                }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.nameInput}
                    placeholder="Confirm Email"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#aaa"
                    onPaste={handlePaste}
                  />
                )}
              />
              {errors.confirmationEmail && (
                <Text style={styles.errorText}>{errors.confirmationEmail.message}</Text>
              )}

              {/* Password */}
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="password"
                  rules={{
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Minimum 6 characters' },
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showPassword}
                      placeholderTextColor="#aaa"
                      onPaste={handlePaste}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}

              {/* Confirm Password */}
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="confirmPassword"
                  rules={{
                    required: 'Confirm your password',
                    validate: (val) => val === password || "Passwords don't match",
                  }}
                  render={({ field: { onChange, value } }) => (
                    <TextInput
                      style={styles.passwordInput}
                      placeholder="Confirm Password"
                      value={value}
                      onChangeText={onChange}
                      secureTextEntry={!showConfirmPassword}
                      placeholderTextColor="#aaa"
                      onPaste={handlePaste}
                    />
                  )}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons name={showConfirmPassword ? 'eye' : 'eye-off'} size={24} color="gray" />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}

              {/* Register Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isDisabled}
                style={[styles.btn, isDisabled ? styles.btnDisabled : styles.btnEnabled]}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.btnText}>Registering...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Register</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
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
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#4B0082',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  subView: {
    flex: 1,
    marginTop: 50,
    backgroundColor: 'white',
    width: '100%',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: 'center',
    paddingVertical: 30,
  },
  subTxt: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    fontFamily: 'Comic Sans MS',
  },
  nameInput: {
    height: 40,
    width: '80%',
    borderBottomWidth: 1,
    marginBottom: 10,
    textAlign: 'start',
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    width: '80%',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  passwordInput: {
    height: 40,
    width: '85%',
    textAlign: 'start',
    fontSize: 16,
  },
  btn: {
    marginTop: 20,
    height: 50,
    width: '80%',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEnabled: {
    backgroundColor: '#4B0082',
  },
  btnDisabled: {
    backgroundColor: '#aaa',
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  endView: {
    flexDirection: 'row',
    marginTop: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  endTxt: {
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  loginTxt: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 8,
    width: '80%',
    textAlign: 'left',
  },
});

export default RegisterScreen;
