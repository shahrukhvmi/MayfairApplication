import React from 'react';
import { View, Text } from 'react-native';
import { Controller } from 'react-hook-form';
import TextFields from '../TextFields';
import NextButton from '../NextButton';


const ResetForm = ({
  control,
  handleSubmit,
  errors,
  onSubmit,
  isLoading,
  getValues,
}) => {
  return (
    <View style={{ paddingHorizontal: 20 }}>
      {/* New Password Field */}
      <Controller
        control={control}
        name="password"
        rules={{
          required: 'Password is required',
          minLength: {
            value: 8,
            message: 'Password must be at least 8 characters',
          },
        }}
        render={({ field: { onChange, value } }) => (
          <TextFields
            label="New Password"
            placeholder="New Password"
            type="password"
            required
            value={value}
            onChangeText={onChange}
            disablePaste
          />
        )}
      />
      {errors.password && (
        <Text style={{ color: 'red', marginBottom: 12 }}>
          {errors.password.message}
        </Text>
      )}

      {/* Confirm Password Field */}
      <Controller
        control={control}
        name="password_confirmation"
        rules={{
          required: 'Please confirm your password',
          validate: (val) =>
            val === getValues('password') || 'Passwords do not match',
        }}
        render={({ field: { onChange, value } }) => (
          <TextFields
            label="Confirm Password"
            placeholder="Confirm Password"
            type="password"
            required
            value={value}
            onChangeText={onChange}
            disablePaste
          />
        )}
      />
      {errors.password_confirmation && (
        <Text style={{ color: 'red', marginBottom: 12 }}>
          {errors.password_confirmation.message}
        </Text>
      )}

      {/* Submit Button */}
      <NextButton
        label="Change Password"
        onPress={handleSubmit(onSubmit)}
        disabled={isLoading}
      />
    </View>
  );
};

export default ResetForm;
