import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons'; // or use MaterialIcons if preferred
import { useNavigation } from '@react-navigation/native';
import NextButton from '../Components/NextButton';

const PaymentFailed = () => {
  const navigation = useNavigation();

  const handleGoBack = () => {
    navigation.navigate('dashboard'); // Ensure 'Dashboard' is defined in your stack
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconWrapper}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="close" size={40} color="#fff" />
          </View>
        </View>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.description}>
          It looks like your payment wasn’t completed. You can try again or
          contact us if you need help.
        </Text>

        <NextButton onPress={handleGoBack} label='Continue to Available Treatments' />
       
      </View>
    </SafeAreaView>
  );
};

export default PaymentFailed;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EEFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // elevation: 5,
    alignItems: 'center',
  },
  iconWrapper: {
    marginBottom: 16,
  },
  errorIconCircle: {
    backgroundColor: 'red',
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#1F2937',
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6B21A8',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: '80%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
});
