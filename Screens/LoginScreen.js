import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {OneSignal} from 'react-native-onesignal';

import {Login} from '../api/loginApi';
import {logApiError, logApiSuccess} from '../utils/logApiDebug';
import useAuthStore from '../store/authStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useSignupStore from '../store/signupStore';
import Fetcher from '../library/Fetcher';
import Toast from 'react-native-toast-message';
import usePasswordReset from '../store/usePasswordReset';
import useReturning from '../store/useReturningPatient';
import usePlayerStore from '../store/usePlayerStore';
import useAbandonCardStore from '../store/useAbandonCardStore';
import useReviewStore from '../store/useReviewStore';
import Header from '../Layout/header';
import TextFields from '../Components/TextFields';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const LoginScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {control, handleSubmit, watch} = useForm();
  const [loading, setLoading] = useState(false);
  const {setIsReturningPatient} = useReturning();

  const {setIsPasswordReset, setShowResetPassword} = usePasswordReset();
  const {setAuthUserDetail} = useAuthUserDetailStore();
  const {token, setToken} = useAuthStore();
  const {abandonCard} = useAbandonCardStore();
  const {review} = useReviewStore();
  const {setLastName, setFirstName, setEmail} = useSignupStore();
  const {playerId} = usePlayerStore();

  useFocusEffect(
    useCallback(() => {
      const fetchPlayerId = async () => {
        try {
          const latestPlayerId =
            await OneSignal.User.pushSubscription.getIdAsync();
          if (latestPlayerId) {
            usePlayerStore.getState().setPlayerId(latestPlayerId);
          }
        } catch (e) {
          console.error('Error fetching player id:', e);
        }
      };
      fetchPlayerId();
    }, []),
  );

  // Once a token exists (login success or already logged in), the protected
  // screens are mounted — land the user on the right screen.
  useFocusEffect(
    useCallback(() => {
      if (!token) return;
      if (abandonCard?.type === 'abandoned-cart') {
        navigation.reset({index: 0, routes: [{name: 'gathering-data'}]});
      } else if (review) {
        navigation.navigate('review-feedback');
      } else {
        navigation.reset({index: 0, routes: [{name: 'dashboard'}]});
      }
    }, [token, abandonCard?.type, review]),
  );

  const loginMutation = useMutation(Login, {
    onMutate: () => setLoading(true),
    onSuccess: data => {
      logApiSuccess(data);
      const user = data?.data?.data;
      Toast.show({type: 'success', text1: 'Login', text2: 'Login Successful'});

      if (!user?.token) {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: 'Invalid response: Missing token',
        });
        setLoading(false);
        return;
      }

      setAuthUserDetail(user);
      setToken(user.token);
      Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
      setFirstName(user?.fname);
      setLastName(user?.lname);
      setEmail(user?.email);
      setIsReturningPatient(user?.isReturning);

      // Navigation is handled by the token-driven useFocusEffect above, which
      // fires once the protected screens are mounted (avoids a mount race).

      setIsPasswordReset(false);
      setShowResetPassword(user?.show_password_reset);
      setLoading(false);
    },
    onError: error => {
      logApiError(error);
      const apiErrors = error?.response?.data?.errors;
      const userError = apiErrors?.user;
      const loginError = apiErrors?.login;

      if (userError) {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: Array.isArray(userError) ? userError[0] : userError,
        });
      }
      if (loginError) {
        Toast.show({
          type: 'error',
          text1: 'Login Error',
          text2: Array.isArray(loginError) ? loginError[0] : loginError,
        });
      }
      if (apiErrors && typeof apiErrors === 'object') {
        const messages = Object.values(apiErrors).flat();
        messages.forEach(msg =>
          Toast.show({type: 'error', text1: 'Login Error', text2: msg}),
        );
      } else {
        Toast.show({
          type: 'error',
          text1: 'Login Failed',
          text2: 'Something went wrong. Please try again.',
        });
      }
    },
    onSettled: () => setLoading(false),
  });

  const onSubmit = data => {
    const formData = {
      email: data.email,
      password: data.password,
      company_id: 1,
      player_id: playerId,
    };
    setEmail(data?.email);
    loginMutation.mutate(formData);
  };

  const email = watch('email');
  const password = watch('password');
  const isDisabled = !email || !password || loginMutation.isLoading;

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
              <Text style={styles.heading}>Login</Text>
              <Text style={styles.description}>
                Returning patient? Login now to re-order your treatment.
              </Text>

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
                    disabled={loginMutation.isLoading}
                  />
                )}
              />

              <Controller
                control={control}
                name="password"
                rules={{required: true}}
                render={({field: {onChange, value}}) => (
                  <TextFields
                    label="Password"
                    placeholder="Enter your password"
                    type="password"
                    required
                    value={value}
                    onChangeText={onChange}
                    disabled={loginMutation.isLoading}
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
                {loginMutation.isLoading ? (
                  <View style={styles.loadingContent}>
                    <ActivityIndicator color="#fff" />
                    <Text style={styles.btnText}> Logging in...</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Login</Text>
                )}
              </TouchableOpacity>

              <Text style={styles.newPatient}>
                Don't have an account?{' '}
                <Text
                  style={styles.link}
                  onPress={() => navigation.navigate('Register')}>
                  Create an account
                </Text>
              </Text>

              <TouchableOpacity
                style={styles.forgotWrap}
                onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={styles.forgotText}>Forgot password</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;

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
  newPatient: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#334155',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  link: {
    color: PRIMARY,
    fontFamily: Fonts.medium,
    textDecorationLine: 'underline',
  },
  forgotWrap: {
    marginTop: 16,
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: PRIMARY,
    textDecorationLine: 'underline',
  },
});
