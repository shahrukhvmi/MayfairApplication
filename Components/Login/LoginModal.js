import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import Entypo from 'react-native-vector-icons/Entypo';

import ForgotForm from './ForgotForm';
import ResetForm from './ResetForm';
import LoginForm from './LoginForm';

import { forgotPasswordLink } from '../../api/forgotPasswordLinkApi';
import { forgotPassword } from '../../api/ChangePasswordApi';
import { passwordlink } from '../../config/constants';

export default function LoginModal({
  show = false,
  onClose = () => { },
  onLogin = () => { },
  isLoading = false,
  modes = 'login',
  token = null,
  emailFromURL = null,
}) {
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    watch,
    formState: { errors },
  } = useForm();

  const [mode, setMode] = useState(modes);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [showLoginMsg, setShowLoginMsg] = useState(false);

  const forgotMutation = useMutation(forgotPassword, {
    onMutate: () => { },
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Password updated successfully' });
      setMode('login');
      setShowLoginMsg(true);
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => Toast.show({ type: 'error', text1: msg }));
      } else {
        Toast.show({ type: 'error', text1: 'Something went wrong' });
      }
    },
  });

  const forgotLinkMutation = useMutation(forgotPasswordLink, {
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Reset link sent. Check your email.' });
      reset();
    },
    onError: (error) => {
      const errors = error?.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((msg) => Toast.show({ type: 'error', text1: msg }));
      } else {
        Toast.show({ type: 'error', text1: 'Something went wrong' });
      }
    },
  });

  useEffect(() => {
    if (token && emailFromURL) setMode('reset');
  }, [token, emailFromURL]);

  const isFormLoading = useMemo(() => {
    return (
      (mode === 'login' && isLoading) ||
      (mode === 'forgot' && forgotLinkMutation.isLoading) ||
      (mode === 'reset' && forgotMutation.isLoading)
    );
  }, [mode, isLoading, forgotLinkMutation.isLoading, forgotMutation.isLoading]);

  return (
    <Modal visible={show} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalBox}>
          {(mode === 'login' || mode === 'forgot') && (
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={{ fontSize: 18 }}>
                <Entypo name="cross" size={24} />







              </Text>
            </TouchableOpacity>
          )}

          <Text style={styles.heading}>
            {mode === 'login'
              ? 'Login'
              : mode === 'forgot'
                ? 'Forgot Password?'
                : 'Reset Password'}
          </Text>

          {showLoginMsg && mode === 'login' && (
            <Text style={styles.successMsg}>Password changed successfully. Please login.</Text>
          )}

          {mode === 'reset' && (
            <ResetForm
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              getValues={getValues}
              isLoading={forgotMutation.isLoading}
              onSubmit={(data) =>
                forgotMutation.mutate({
                  email: emailFromURL,
                  password: data.password,
                  password_confirmation: data.password_confirmation,
                  token,
                  passwordlink: 'your-passwordlink-url',
                  company_id: 1,
                })
              }
            />
          )}

          {mode === 'forgot' && (
            <ForgotForm
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              submittedEmail={submittedEmail}
              isLoading={forgotLinkMutation.isLoading}
              isSuccess={forgotLinkMutation.isSuccess}
              watch={watch}
              passwordlink={passwordlink}
              onSubmit={(data) => {
                setSubmittedEmail(data.email);
                forgotLinkMutation.mutate({
                  email: data.email,
                  passwordlink: passwordlink,
                  clinic_id: 1,
                });
              }}
              onBack={() => setMode('login')}
            />
          )}

          {mode === 'login' && (
            <LoginForm
              register={register}
              handleSubmit={handleSubmit}
              errors={errors}
              isLoading={isLoading}
              onLogin={onLogin}
              onForgot={() => setMode('forgot')}
            />
          )}

          {isFormLoading && (
            <View style={styles.loaderOverlay}>
              <ActivityIndicator size="large" color="#000" />
            </View>
          )}
        </View>
      </View>
      <Toast />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  heading: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  successMsg: {
    color: 'green',
    textAlign: 'center',
    marginBottom: 10,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});
