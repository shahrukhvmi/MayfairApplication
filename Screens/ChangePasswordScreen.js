import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, Modal} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';
import Feather from 'react-native-vector-icons/Feather';
import Toast from 'react-native-toast-message';

import {ChangePassword} from '../api/ChangePassword';
import NextButton from '../Components/NextButton';
import useSignupStore from '../store/signupStore';
import TextFields from '../Components/TextFields';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const PasswordRequirement = ({valid, label}) => (
  <View style={[styles.reqItem, valid && styles.reqItemValid]}>
    <View style={[styles.reqIconCircle, valid && styles.reqIconCircleValid]}>
      <Feather
        name={valid ? 'check' : 'x'}
        size={13}
        color={valid ? '#059669' : '#94a3b8'}
      />
    </View>
    <Text style={[styles.reqText, valid && styles.reqTextValid]}>
      {label}
    </Text>
  </View>
);

export default function PasswordChange() {
  const {email} = useSignupStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: {errors, isValid},
  } = useForm({mode: 'onChange'});

  const newPassword = watch('newpassword') || '';
  const confirmPassword = watch('newpassword_confirmation') || '';

  const validations = {
    length: newPassword.length >= 8,
    case: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    match: newPassword === confirmPassword && confirmPassword !== '',
  };

  const completedCount = Object.values(validations).filter(Boolean).length;
  const progress = (completedCount / 5) * 100;

  const changePasswordMutation = useMutation(ChangePassword, {
    onSuccess: () => {
      reset();
      setIsLoading(false);
      setShowSuccess(true);
    },
    onError: error => {
      const errorObj = error?.response?.data?.errors;
      const message =
        errorObj && typeof errorObj === 'object'
          ? Object.values(errorObj)?.[0]
          : 'Something went wrong.';
      Toast.show({type: 'error', text1: message});
      setIsLoading(false);
    },
  });

  const onSubmit = data => {
    const isStrong = Object.values(validations).every(Boolean);
    if (!isStrong) {
      Toast.show({
        type: 'error',
        text1: 'Please complete all password requirements.',
      });
      return;
    }

    setIsLoading(true);
    changePasswordMutation.mutate({
      old_password: data.old_password,
      newpassword: data.newpassword,
      newpassword_confirmation: data.newpassword_confirmation,
    });
  };

  return (
    <>
      <Header />
      <ScrollView
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 16},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>PASSWORD</Text>
          <Text style={styles.pageTitle}>Change Password</Text>
          <Text style={styles.pageSubtitle}>
            Create a strong, secure password to protect your account.
          </Text>
        </View>

        {/* Requirements card */}
        <View style={styles.reqCard}>
          <View style={styles.reqCardHeader}>
            <View style={styles.reqCardIconBox}>
              <Feather name="key" size={18} color="#fff" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.reqCardTitle}>Password requirements</Text>
              <Text style={styles.reqCardSubtitle}>
                {completedCount} of 5 completed
              </Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, {width: `${progress}%`}]} />
          </View>

          <View style={styles.reqList}>
            <PasswordRequirement
              valid={validations.length}
              label="At least 8 characters"
            />
            <PasswordRequirement
              valid={validations.case}
              label="Upper and lower case letters"
            />
            <PasswordRequirement
              valid={validations.special}
              label="At least 1 special character"
            />
            <PasswordRequirement
              valid={validations.number}
              label="At least 1 number"
            />
            <PasswordRequirement
              valid={validations.match}
              label="Passwords must match"
            />
          </View>
        </View>

        {/* Password form card */}
        <View style={styles.formCard}>
          <View style={styles.formCardHeader}>
            <View style={styles.formIconBox}>
              <Feather name="lock" size={18} color={PRIMARY} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.formTitle}>Update your password</Text>
              <Text style={styles.formSubtitle}>
                Please create a strong password for your account.
              </Text>
            </View>
          </View>

          <View style={{marginTop: 20}}>
            <Controller
              control={control}
              name="old_password"
              rules={{required: 'Current password is required'}}
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Current Password"
                  type="password"
                  value={value}
                  onChangeText={onChange}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="newpassword"
              rules={{
                required: 'New password is required',
                minLength: {
                  value: 8,
                  message: 'Password must be at least 8 characters',
                },
              }}
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="New Password"
                  type="password"
                  value={value}
                  onChangeText={onChange}
                  required
                />
              )}
            />

            <Controller
              control={control}
              name="newpassword_confirmation"
              rules={{
                required: 'Please confirm your password',
                validate: v => v === newPassword || 'Passwords do not match',
              }}
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Confirm Password"
                  type="password"
                  value={value}
                  onChangeText={onChange}
                  required
                />
              )}
            />

            <View style={styles.infoNote}>
              <Feather
                name="info"
                size={14}
                color="#94a3b8"
                style={{marginTop: 1}}
              />
              <Text style={styles.infoNoteText}>
                After updating your password, use the new password the next
                time you sign in.
              </Text>
            </View>

            <NextButton
              type="submit"
              label={isLoading ? 'Saving...' : 'Save password'}
              disabled={!isValid || isLoading}
              onPress={handleSubmit(onSubmit)}
              style={styles.submitButton}
            />
          </View>
        </View>

        {/* Account email */}
        <View style={styles.emailCard}>
          <View style={styles.emailCardHeader}>
            <View style={styles.emailIconBox}>
              <Feather name="mail" size={16} color={PRIMARY} />
            </View>
            <View>
              <Text style={styles.emailTitle}>Account email</Text>
              <Text style={styles.emailSubtitle}>
                Associated with this account
              </Text>
            </View>
          </View>
          <View style={styles.emailBox}>
            <Text style={styles.emailText} numberOfLines={1}>
              {email || 'Not available'}
            </Text>
          </View>
          <Text style={styles.emailNote}>
            This email is linked to your account and cannot be changed from
            this page.
          </Text>
        </View>
      </ScrollView>

      <Modal
        visible={showSuccess}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSuccess(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Feather name="check" size={28} color="#fff" />
            </View>
            <Text style={styles.modalTitle}>Password Changed</Text>
            <Text style={styles.modalMessage}>
              Your password has been updated successfully. Use your new
              password the next time you sign in.
            </Text>
            <NextButton
              label="Done"
              onPress={() => setShowSuccess(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#FBFBFD',
  },

  // Page header
  pageHeader: {
    borderWidth: 1,
    borderColor: '#e4e0f5',
    borderRadius: 16,
    backgroundColor: '#fbfaff',
    padding: 18,
    marginBottom: 16,
  },
  pageLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: 'rgba(71, 49, 124, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 21,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 17,
  },

  // Requirements card
  reqCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 16,
  },
  reqCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reqCardIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  reqCardTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  reqCardSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 2,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    marginTop: 18,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: PRIMARY,
  },
  reqList: {
    marginTop: 18,
    gap: 10,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  reqItemValid: {
    borderColor: '#a7f3d0',
    backgroundColor: 'rgba(236, 253, 245, 0.7)',
  },
  reqIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reqIconCircleValid: {
    backgroundColor: '#d1fae5',
  },
  reqText: {
    fontSize: 12,
    fontFamily: Fonts.medium,
    color: '#64748b',
  },
  reqTextValid: {
    color: '#047857',
  },

  // Form card
  formCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
    marginBottom: 16,
  },
  formCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    paddingBottom: 18,
  },
  formIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formTitle: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  formSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 3,
    lineHeight: 17,
  },
  infoNote: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
    marginTop: 4,
    marginBottom: 16,
  },
  infoNoteText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 16,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 46,
  },

  // Email card
  emailCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 18,
  },
  emailCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  emailIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emailTitle: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#0f172a',
  },
  emailSubtitle: {
    fontSize: 10.5,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 1,
  },
  emailBox: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  emailText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  emailNote: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 10,
    lineHeight: 16,
  },

  // Success modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  modalIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 22,
  },
  modalButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 46,
    width: '100%',
  },
});
