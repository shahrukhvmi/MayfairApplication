import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import useSignupStore from '../store/signupStore';
import useAuthStore from '../store/authStore';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import TextFields from '../Components/TextFields';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 10;

const SignUpScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showLoader, setShowLoader] = React.useState(false);

  const {token} = useAuthStore();
  const {firstName, lastName, setFirstName, setLastName} = useSignupStore();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: {isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      firstName: '',
      lastName: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      setValue('firstName', firstName);
      setValue('lastName', lastName);

      if (firstName || lastName) {
        trigger(['firstName', 'lastName']);
      }
    }, [firstName, lastName, setValue, trigger]),
  );

  const onSubmit = async data => {
    setFirstName(data.firstName);
    setLastName(data.lastName);

    setShowLoader(true);
    await new Promise(res => setTimeout(res, 500));

    setShowLoader(false);
    navigation.navigate('steps-information');
  };

  return (
    <>
      <Header />

      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
              <Text style={styles.progressLabel}>{PERCENTAGE}% COMPLETED</Text>
              <Text style={styles.heading}>Enter your full legal name</Text>
              <Text style={styles.description}>
                We require this to generate your prescription if you qualify
                for the treatment.
              </Text>
            </View>

            <View style={[styles.cardBody, showLoader && {opacity: 0.5}]}>
              <Controller
                control={control}
                name="firstName"
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <TextFields
                    label="First Name"
                    placeholder="Enter your first name"
                    onChangeText={onChange}
                    value={value}
                    required
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <TextFields
                    label="Last Name"
                    placeholder="Enter your last name"
                    onChangeText={onChange}
                    value={value}
                    required
                  />
                )}
              />

              <View style={styles.buttonWrap}>
                <NextButton
                  label="Next"
                  onPress={handleSubmit(onSubmit)}
                  disabled={!isValid}
                  loading={showLoader}
                  style={styles.submitButton}
                />
                <BackButton
                  label="Back"
                  onPress={() => navigation.navigate('Acknowledgment')}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
};

export default SignUpScreen;

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

  buttonWrap: {
    marginTop: 8,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
