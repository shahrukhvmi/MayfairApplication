import React, {useEffect} from 'react';
import {View, Text} from 'react-native';
import {OneSignal, LogLevel} from 'react-native-onesignal';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import SplashScreen from './Screens/SplashScreen';
import InitialScreen from './Screens/InitialScreen';
import AcknowledgmentScreen from './Screens/AcknowledgmentScreen';
import FirstLastNameScreen from './Screens/FirstLastNameScreen';
import EmailConfirmation from './Screens/EmailConfirmationScreen';
import PersonalDetailScreen from './Screens/PersonalDetailScreen';
import ResidentialAddressScreen from './Screens/ResidentialAddressScreen';

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
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
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
          name="email-confirmation"
          component={EmailConfirmation}
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
