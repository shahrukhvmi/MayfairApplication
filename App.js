import React, { useEffect } from 'react';
import { OneSignal, LogLevel } from 'react-native-onesignal';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './Screens/SplashScreen';
import InitialScreen from './Screens/InitialScreen';
import AcknowledgmentScreen from './Screens/AcknowledgmentScreen';
import FirstLastNameScreen from './Screens/FirstLastNameScreen';
import PersonalDetailScreen from './Screens/PersonalDetailScreen';
import ResidentialAddressScreen from './Screens/ResidentialAddressScreen';
import PreferredPhoneNumber from './Screens/PreferredPhoneNumber';
import Ethnicity from './Screens/Ethnicity';
import CalculateWeight from './Screens/CalculateWeight';
import CalculateHeight from './Screens/CalculateHeight';
import BMI from './Screens/BMI';
import GPDetails from './Screens/GPDetails';
import ConfirmationSummary from './Screens/ConfirmationSummary';
import DoseSelection from './Screens/DoseSelection';
import CheckoutScreen from './Screens/CheckoutScreen';
import PatientConsent from './Screens/PatientConsent';
import MedicalQuestions from './Screens/MedicalQuestions';
import Dashboard from './Screens/Dashboard';
import EmailConfirmationScreen from './Screens/EmailConfirmationScreen';
import StepsInformation from './Screens/StepsInformation';
import OrderDetail from './Screens/OrderDetail';
import Toast from 'react-native-toast-message';
import LoginScreen from './Screens/LoginScreen';
import RegisterScreen from './Screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  useEffect(() => {
    OneSignal.Debug.setLogLevel(LogLevel.Verbose);
    OneSignal.initialize('64ed9644-07f9-4a7a-ad45-767c0809d731');
    OneSignal.Notifications.requestPermission(true);

    // Get the current player ID asynchronously
    OneSignal.User.pushSubscription.getIdAsync().then(playerId => {
      if (playerId) {
        console.log('✅ Player ID:', playerId);
        // Send playerId to your backend here
      } else {
        console.log('Player ID not available yet');
      }
    });
  }, []);

  return (
    <>


      <NavigationContainer>
        <Stack.Navigator initialRouteName="Splash">
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          
          <Stack.Screen
            name="Initial"
            component={InitialScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Acknowledgment"
            component={AcknowledgmentScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="signup"
            component={FirstLastNameScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="email-confirmation"
            component={EmailConfirmationScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="steps-information"
            component={StepsInformation}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="personal-details"
            component={PersonalDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="residential-address"
            component={ResidentialAddressScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="preferred-phone-number"
            component={PreferredPhoneNumber}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="ethnicity"
            component={Ethnicity}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="calculate-height"
            component={CalculateHeight}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="calculate-weight"
            component={CalculateWeight}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="bmi"
            component={BMI}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="medical-questions"
            component={MedicalQuestions}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="patient-consent"
            component={PatientConsent}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="gp-detail"
            component={GPDetails}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="confirmation-summary"
            component={ConfirmationSummary}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="dose-selection"
            component={DoseSelection}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="checkout"
            component={CheckoutScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="dashboard"
            component={Dashboard}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="order-detail"
            component={OrderDetail}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>


      <Toast />
    </>
  );
};



export default App;
