import React, {useEffect, useRef} from 'react';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from './Screens/SplashScreen';
import InitialScreen from './Screens/InitialScreen';
import AcknowledgmentScreen from './Screens/AcknowledgmentScreen';
import FirstLastNameScreen from './Screens/FirstLastNameScreen';
import PersonalDetailScreen from './Screens/PersonalDetailScreen';
import ResidentialAddressScreen from './Screens/ResidentialAddressScreen';
import PreferredPhoneNumber from './Screens/PreferredPhoneNumber';
import Ethnicity from './Screens/Ethnicity';
import CalculateWeight from './Screens/CalculateWeight';
import BMI from './Screens/BMI';
import GPDetails from './Screens/GPDetails';
import ConfirmationSummary from './Screens/ConfirmationSummary';
import DoseSelection from './Screens/DoseSelection';
import CheckoutScreen from './Screens/CheckoutScreen';
import PatientConsent from './Screens/PatientConsent';
import MedicalQuestions from './Screens/MedicalQuestions';
import Dashboard from './Screens/Dashboard';
import StepsInformation from './Screens/StepsInformation';
import OrderDetail from './Screens/OrderDetail';
import Toast from 'react-native-toast-message';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';
import ForgotPassword from './Screens/ForgotPassword';
import ResetPassword from './Screens/ResetPassword';
import CalculateBmi from './Screens/CalculateBmi';
import GatheringData from './Screens/GatheringData';
import ReOrder from './Screens/ReOrder';
import ReviewAnswers from './Screens/ReviewAnswers';
import {BackHandler, Linking} from 'react-native';
import usePlayerStore from './store/usePlayerStore';
import useAbandonCardStore from './store/useAbandonCardStore';
import useProductId from './store/useProductIdStore';
import PaymentSuccess from './Screens/PaymentSuccess';
import PaymentFailed from './Screens/PaymentFailed';
import {navigationRef} from './Components/navigationRef';
import PhotoUpload from './Screens/PhotoUpload';
import IdVerification from './Screens/IdVerification';
import ReviewScreen from './Screens/ReviewScreen';
import useReviewStore from './store/useReviewStore';

const Stack = createNativeStackNavigator();

const App = () => {
  /* _________________Deep Linking here ______________*/

  const linking = {
    prefixes: ['https://mayfair-staging.netlify.app', 'mayfairapp://'],
    config: {
      screens: {
        ResetPassword: {
          path: 'reset-password',
          parse: {
            token: token => `${token}`,
            email: email => decodeURIComponent(email),
          },
        },
        PaymentSuccess: 'payment-success',
        PaymentFailed: 'payment-failed',
      },
    },
  };

  const {setPlayerId} = usePlayerStore();
  const {setAbandonCard} = useAbandonCardStore();
  const {setProductId} = useProductId();
  const {setReview, setOrderId} = useReviewStore();

  // URL ke query params parse karne ka helper
  const parseParams = url => {
    const query = (url || '').split('?')[1];
    if (!query) return {};
    return query.split('&').reduce((acc, pair) => {
      const [k, v] = pair.split('=');
      if (k) acc[decodeURIComponent(k)] = decodeURIComponent(v || '');
      return acc;
    }, {});
  };

  // Email deep link aur push notification — dono isko call karenge (shared)
  const handleAbandonedCart = params => {
    const productId = params?.product_id ? Number(params.product_id) : null;
    const eid = params?.eid ? Number(params.eid) : null;
    if (params?.type !== 'abandoned-cart' || !productId) return false;

    setProductId(productId);
    setAbandonCard({
      productId,
      fromEmail: params.fromemail,
      type: params.type,
      eid,
    });
    navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
    return true;
  };

  /* _________________One Signal Notification here ______________*/

  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('64ed9644-07f9-4a7a-ad45-767c0809d731');
    OneSignal.Notifications.requestPermission(true);

    const handleSubscriptionChange = subscription => {
      const id = subscription?.current?.id;
      if (id) {
        console.log('Player ID (change):', id);
        setPlayerId(id);
      }
    };

    OneSignal.User.pushSubscription.addEventListener(
      'change',
      handleSubscriptionChange,
    );

    // Push notification click → abandoned cart (email deep link jaisa hi kaam)
    const handleNotificationClick = event => {
      const data = event?.notification?.additionalData;
      if (data?.type === 'abandoned-cart') {
        handleAbandonedCart({
          product_id: data.product_id,
          type: data.type,
          eid: data.eid,
          fromemail: data.fromemail,
        });
      } else if (data?.type === 'review') {
        setReview(true);
        if (data?.order_id) setOrderId(Number(data.order_id));
        navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
      }
    };
    OneSignal.Notifications.addEventListener('click', handleNotificationClick);

    OneSignal.User.pushSubscription.getIdAsync().then(id => {
      if (id) {
        console.log('Player ID (existing):', id);
        setPlayerId(id);
      }
    });

    return () => {
      OneSignal.User.pushSubscription.removeEventListener(
        'change',
        handleSubscriptionChange,
      );
      OneSignal.Notifications.removeEventListener(
        'click',
        handleNotificationClick,
      );
    };
  }, []);

  useEffect(() => {
    const handleDeepLink = ({url}) => {
      if (!url) return;

      // Abandoned cart deep link (email button) — params parse karke handle karo
      if (url.includes('type=abandoned-cart')) {
        if (handleAbandonedCart(parseParams(url))) return;
      }

      // Review deep link — login?review=true&order_id=xxx
      if (url.includes('review=true')) {
        const params = parseParams(url);
        setReview(true);
        if (params?.order_id) setOrderId(Number(params.order_id));
        navigationRef.reset({index: 0, routes: [{name: 'Login'}]});
        return;
      }

      // Handles both https App Links (Android) and mayfairapp:// custom scheme (iOS)
      if (url.includes('payment-success')) {
        navigationRef.reset({index: 0, routes: [{name: 'PaymentSuccess'}]});
      } else if (url.includes('payment-failed')) {
        navigationRef.reset({index: 0, routes: [{name: 'PaymentFailed'}]});
      }
    };

    Linking.getInitialURL().then(url => {
      if (url) handleDeepLink({url});
    });

    const linkingListener = Linking.addEventListener('url', handleDeepLink);
    return () => linkingListener.remove();
  }, []);

  // Device hardware/gesture back block karo. Native-stack mein react-navigation
  // har navigation pe apna back handler dobara register karta hai, isliye humein
  // bhi onStateChange pe dobara register karna padta hai taake LIFO priority pe
  // sabse upar rahe aur back block ho.
  const backSubRef = useRef(null);
  const registerBackBlock = () => {
    backSubRef.current?.remove?.();
    backSubRef.current = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        console.log('🔙 hardware back blocked');
        return true;
      },
    );
  };

  useEffect(() => {
    registerBackBlock();
    return () => backSubRef.current?.remove?.();
  }, []);

  return (
    <SafeAreaProvider>
      {/* _________________All Routes here ______________*/}
      <NavigationContainer
        linking={linking}
        ref={navigationRef}
        onStateChange={registerBackBlock}>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="ForgotPassword"
            component={ForgotPassword}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="ResetPassword"
            component={ResetPassword}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="Initial"
            component={InitialScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="Acknowledgment"
            component={AcknowledgmentScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="signup"
            component={FirstLastNameScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="personal-details"
            component={PersonalDetailScreen}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="residential-address"
            component={ResidentialAddressScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="preferred-phone-number"
            component={PreferredPhoneNumber}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="ethnicity"
            component={Ethnicity}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="calculate-bmi"
            component={CalculateBmi}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="calculate-weight"
            component={CalculateWeight}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="bmi"
            component={BMI}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="medical-questions"
            component={MedicalQuestions}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="patient-consent"
            component={PatientConsent}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="gp-detail"
            component={GPDetails}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="confirmation-summary"
            component={ConfirmationSummary}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="review-answer"
            component={ReviewAnswers}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="gathering-data"
            component={GatheringData}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="steps-information"
            component={StepsInformation}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="dose-selection"
            component={DoseSelection}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="checkout"
            component={CheckoutScreen}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="dashboard"
            component={Dashboard}
            options={{headerShown: false}}
          />

          <Stack.Screen
            name="order-detail"
            component={OrderDetail}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="re-order"
            component={ReOrder}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="PaymentSuccess"
            component={PaymentSuccess}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="PaymentFailed"
            component={PaymentFailed}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="photo-upload"
            component={PhotoUpload}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="id-verification"
            component={IdVerification}
            options={{headerShown: false}}
          />
          <Stack.Screen
            name="review-feedback"
            component={ReviewScreen}
            options={{headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>

      {/* _________________Toast here ______________ */}
      <Toast />
    </SafeAreaProvider>
  );
};

export default App;
