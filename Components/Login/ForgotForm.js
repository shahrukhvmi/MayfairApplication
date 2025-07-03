import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { Controller, useForm } from 'react-hook-form';

import { useMutation } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import TextFields from '../TextFields';
import NextButton from '../NextButton';
import BackButton from '../BackButton';
import { forgotPasswordLink } from '../../api/forgotPasswordLinkApi';

const ForgotForm = ({ onBack, passwordlink, submittedEmail: emailFromParent }) => {
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const [resendTimer, setResendTimer] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(emailFromParent || '');
  const [isSuccess, setIsSuccess] = useState(false);

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
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [resendTimer]);

  const handleResendLink = () => {
    if (!submittedEmail) {
      Toast.show({ type: 'error', text1: 'Email address is missing.' });
      return;
    }

    setResendLoading(true);

    forgotLinkMutation.mutate(
      {
        email: submittedEmail,
        passwordlink,
        clinic_id: 1,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Reset link sent. Check your email.' });
          setResendTimer(30);
          setResendLoading(false);
        },
        onError: (error) => {
          const errors = error?.response?.data?.errors;
          if (errors && typeof errors === 'object') {
            Object.values(errors).flat().forEach((msg) => Toast.show({ type: 'error', text1: msg }));
          } else {
            Toast.show({ type: 'error', text1: 'Something went wrong.' });
          }
          setResendLoading(false);
        },
      }
    );
  };

  const onSubmit = (data) => {
    setSubmittedEmail(data.email);

    forgotLinkMutation.mutate(
      {
        email: data.email,
        passwordlink,
        clinic_id: 1,
      },
      {
        onSuccess: () => {
          Toast.show({ type: 'success', text1: 'Reset link sent to email.' });
          setIsSuccess(true);
        },
        onError: (error) => {
           setIsSuccess(false);
          console.log(error, 'Error in forgot link mutation');
          const errors = error?.response?.data?.errors;
          if (errors && typeof errors === 'object') {
            Object.values(errors).flat().forEach((msg) => Toast.show({ type: 'error', text1: msg }));
          } else {
            Toast.show({ type: 'error', text1: 'Something went wrongssss.' });
          }
        },
      }
    );
  };

  return (
    <View style={{ padding: 20 }}>
      {isSuccess ? (
        <>
          <Text style={{ color: 'green', marginBottom: 10 }}>
            A password reset link has been sent to your email address.
          </Text>
          <Text style={{ color: '#666', marginBottom: 16 }}>
            Didn’t receive it? Check your spam or junk folder.
          </Text>

          <NextButton
            label={
              resendTimer > 0
                ? `Resend Password Reset Link (${resendTimer}s)`
                : 'Resend Password Reset Link'
            }
            onPress={handleResendLink}
            disabled={resendLoading || resendTimer > 0}
            loading={resendLoading}
          />
        </>
      ) : (
        <>
          <Text style={{ marginBottom: 20, color: '#333' }}>
            Enter your email address below and we will send you a password reset link.
          </Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: 'Invalid email address',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <TextFields
                label="Email Address"
                placeholder="Enter your email"
                value={value}
                onChangeText={onChange}
                type="text"
                required
              />
            )}
          />
          {errors.email && (
            <Text style={{ color: 'red', marginBottom: 10 }}>
              {errors.email.message}
            </Text>
          )}

          <NextButton
            label="Send Password Reset Link"
            onPress={handleSubmit(onSubmit)}
            disabled={forgotLinkMutation.isLoading}
            loading={forgotLinkMutation.isLoading}
          />

          <View style={{ marginTop: 16 }}>
            <BackButton onPress={onBack} label="Back to Login" />
          </View>
        </>
      )}
    </View>
  );
};

export default ForgotForm;
