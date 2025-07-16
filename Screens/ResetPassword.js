import React, { useEffect, useState } from 'react';
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
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import { logApiSuccess } from '../utils/logApiDebug';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { forgotPassword } from '../api/ChangePasswordApi';
import { Controller, useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';

const ResetPassword = () => {
  const route = useRoute();
  const { token, email } = route.params || {};
  const navigation = useNavigation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, watch, formState: { errors } } = useForm();

  const forgotPasswordMutation = useMutation(
    forgotPassword,
    {
      onSuccess: (data) => {
        logApiSuccess(data);
        Toast.show({
          type: 'success',
          text1: 'Password Updated Successfully',
          text2: 'You can now log in with your new password.',
        }); navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        setLoading(false);
      },
      onError: (error) => {
        logApiError(error);
        Toast.show({ type: 'error', text1: 'Something went wrong. Please try again later.' });
        setLoading(false);
      },
    }
  );

  useEffect(() => {
    if (token) console.log('🔐 Token from URL:', token);
    else console.log('❌ No token found in params');
  }, [token]);

  const onSubmit = (data) => {
    const formData = { email, token, password: data.password, password_confirmation: data.confirmPassword, company_id: 1 };
    setLoading(true);
    forgotPasswordMutation.mutate(formData);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    Alert.alert('Copy-pasting is disabled');
  };


  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const isDisabled = !password || !confirmPassword || loading;


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
          <View style={styles.container}>
            <View style={styles.logoContainer}>
              <Image source={require('../assets/images/logo-white.png')} style={styles.image} />
            </View>
            <View style={styles.subView}>
              <Text style={styles.subTxt}>Reset Password</Text>

              {/* Password */}
              <View style={styles.passwordContainer}>
                <Controller
                  control={control}
                  name="password"
                  rules={{ required: 'Password is required' }}
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
                  <Ionicons
                    name={showPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
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
                    validate: (val) => val === watch('password') || "Passwords don't match",
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
                  <Ionicons
                    name={showConfirmPassword ? 'eye' : 'eye-off'}
                    size={24}
                    color="gray"
                  />
                </TouchableOpacity>
              </View>
              {errors.confirmPassword && (
                <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isDisabled}
                style={[styles.btn, isDisabled ? styles.btnDisabled : styles.btnEnabled]}
              >
                {loading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.btnText}>Submitting...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Submit</Text>
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
  container: { backgroundColor: '#4B0082', flex: 1, justifyContent: 'flex-start', alignItems: 'center' },
  subView: { flex: 1, marginTop: 50, backgroundColor: 'white', width: '100%', borderTopLeftRadius: 40, borderTopRightRadius: 40, alignItems: 'center', paddingVertical: 30 },
  subTxt: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, fontFamily: 'Comic Sans MS' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, width: '80%', marginBottom: 10, justifyContent: 'space-between' },
  passwordInput: { height: 40, width: '85%', textAlign: 'start', fontSize: 16 },
  btn: { marginTop: 20, height: 50, width: '80%', borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  btnEnabled: { backgroundColor: '#4B0082' },
  btnDisabled: { backgroundColor: '#aaa' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loadingContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  endView: { flexDirection: 'row', marginTop: 30, justifyContent: 'center', alignItems: 'center' },
  endTxt: { fontSize: 16, fontWeight: '600', marginRight: 8 },
  loginTxt: { fontSize: 16, fontWeight: 'bold', color: '#4B0082' },
  logoContainer: { alignItems: 'center', justifyContent: 'center' },
  image: { width: 200, height: 200, resizeMode: 'contain' },
  errorText: { color: 'red', fontSize: 12, marginBottom: 8, width: '80%', textAlign: 'left' },
});

export default ResetPassword;
