import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';


import { ChangePassword } from '../api/ChangePassword';
import NextButton from '../Components/NextButton';
import useSignupStore from '../store/signupStore';
import TextFields from '../Components/TextFields';
import Header from '../Layout/header';

export default function PasswordChange() {
  const { email } = useSignupStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm({ mode: 'onChange' });

  const newPassword = watch('newpassword');
  const confirmPassword = watch('newpassword_confirmation');

  const changePasswordMutation = useMutation(ChangePassword, {
    onSuccess: () => {
      Toast.show({ type: 'success', text1: 'Password changed successfully.' });
      reset();
      setIsLoading(false);
    },
    onError: (error) => {
      const errorObj = error?.response?.data?.errors;
      const message =
        errorObj && typeof errorObj === 'object'
          ? Object.values(errorObj)?.[0]
          : 'Something went wrong.';
      Toast.show({ type: 'error', text1: message });
      setIsLoading(false);
    },
  });

  const onSubmit = (data) => {
    const validations = {
      length: data.newpassword.length >= 8,
      case: /[a-z]/.test(data.newpassword) && /[A-Z]/.test(data.newpassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(data.newpassword),
      number: /[0-9]/.test(data.newpassword),
      match: data.newpassword === data.newpassword_confirmation,
    };

    const isStrong = Object.values(validations).every(Boolean);
    if (!isStrong) {
      Toast.show({ type: 'error', text1: 'Please complete all password requirements.' });
      return;
    }

    setIsLoading(true);
    changePasswordMutation.mutate({
      old_password: data.old_password,
      newpassword: data.newpassword,
      newpassword_confirmation: data.newpassword_confirmation,
    });
  };

  const PasswordCheck = ({ valid, label }) => (
    <View style={styles.checkItem}>
      <Text style={styles.checkText}>{label}</Text>
      {valid ? (
        <Ionicons name="checkmark-circle" size={20} color="#10B981" />
      ) : (
        <Ionicons name="close-circle" size={20} color="#EF4444" />
      )}
    </View>
  );

  return (

    <>

      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Change Password</Text>
        <Text style={styles.description}>Please create a strong password for your account.</Text>

        <Controller
          control={control}
          name="old_password"
          rules={{ required: 'Current password is required' }}
          render={({ field: { onChange, value } }) => (
            <TextFields
              label="Current Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.old_password?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newpassword"
          rules={{
            required: 'New password is required',
            minLength: { value: 8, message: 'Password must be at least 8 characters' },
          }}
          render={({ field: { onChange, value } }) => (
            <TextFields
              label="New Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.newpassword?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="newpassword_confirmation"
          rules={{
            required: 'Please confirm your password',
            validate: (v) => v === newPassword || 'Passwords do not match',
          }}
          render={({ field: { onChange, value } }) => (
            <TextFields
              label="Confirm Password"
              value={value}
              onChangeText={onChange}
              secureTextEntry
              error={errors.newpassword_confirmation?.message}
            />
          )}
        />

        <View style={styles.requirements}>
          <PasswordCheck valid={newPassword?.length >= 8} label="At least 8 characters." />
          <PasswordCheck valid={/[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword)} label="Upper and lower case." />
          <PasswordCheck valid={/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)} label="One special character." />
          <PasswordCheck valid={/[0-9]/.test(newPassword)} label="At least 1 number." />
          <PasswordCheck valid={newPassword === confirmPassword && confirmPassword !== ''} label="Passwords must match." />
        </View>

        <NextButton
          type="submit"
          label={isLoading ? 'Saving...' : 'Save'}
          disabled={!isValid || isLoading}
          onPress={handleSubmit(onSubmit)}
        />

        <View style={styles.emailBox}>
          <Text style={styles.emailText}>{email}</Text>
          <Text style={styles.note}>This email is associated with your account and cannot be changed.</Text>
        </View>
      </ScrollView>

    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F9FAFB',
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 6,
    color: '#111827',
  },
  description: {
    fontSize: 14,
    marginBottom: 18,
    color: '#6B7280',
  },
  requirements: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 10,
    marginTop: 16,
    marginBottom: 20,
  },
  checkItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkText: {
    fontSize: 14,
    color: '#374151',
  },
  emailBox: {
    marginTop: 24,
    backgroundColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
  },
  emailText: {
    color: '#111827',
    fontSize: 14,
  },
  note: {
    marginTop: 6,
    fontSize: 12,
    color: '#6B7280',
  },
});
