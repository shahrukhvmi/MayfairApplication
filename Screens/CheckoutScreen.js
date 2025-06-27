import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Header from '../Layout/header';
import TextFields from '../Components/TextFields';

const steps = ['Set Password', 'Shipping Address', 'Billing Address', 'Consent', 'Summary'];

export default function CheckoutSteps() {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();

  const goNext = () => {
    if (currentStep === 0) {
      if (!password || !confirmPassword) {
        alert('Please fill in both password fields.');
        return;
      }
      if (password !== confirmPassword) {
        alert('Passwords do not match.');
        return;
      }
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const goBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = () => {
    if (!isChecked) {
      alert('Please confirm the consent.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setThankYou(true);

      setTimeout(() => {
        setThankYou(false);
        navigation.navigate('Initial');
      }, 1500);
    }, 2000);
  };

  return (
    <>
      <Header />
      <ScrollView style={styles.container}>
        <Text style={styles.heading}>Step {currentStep + 1}: {steps[currentStep]}</Text>

        {currentStep === 0 && (
          <View style={styles.card}>
            <TextFields
              label="Password"
              placeholder="Enter Password"
              type="password"
              required
              value={password}
              onChangeText={setPassword}
            />
            <TextFields
              label="Confirm Password"
              placeholder="Re-enter Password"
              type="password"
              required
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        )}

        {currentStep === 1 && (
          <View style={styles.card}>
            <TextFields label="First Name" placeholder="First Name" />
            <TextFields label="Last Name" placeholder="Last Name" />
            <TextFields label="Country" placeholder="Country" />
            <TextFields label="Postcode" placeholder="Postcode" />
            <TextFields label="Street Address" placeholder="Street Address" />
            <TextFields label="City" placeholder="City" />
          </View>
        )}

        {currentStep === 2 && (
          <View style={styles.card}>
            <TextFields label="Country" placeholder="Country" />
            <TextFields label="Postcode" placeholder="Postcode" />
            <TextFields label="Address" placeholder="Address" />
            <TextFields label="City" placeholder="City" />
            <TextFields label="State / County" placeholder="State / County" />
          </View>
        )}

        {currentStep === 3 && (
          <View style={styles.card}>
            <Text style={styles.paragraph}>
              • Treatment guidelines...{"\n"}• I confirm that I’ve read and agree...
            </Text>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                onPress={() => setIsChecked(!isChecked)}
                style={[styles.checkbox, isChecked && styles.checkedBox]}
              >
                {isChecked && <Text style={styles.tick}>✓</Text>}
              </TouchableOpacity>
              <Text style={{ marginLeft: 8 }}>I accept all terms and conditions</Text>
            </View>
          </View>
        )}

        {currentStep === 4 && (
          <View style={styles.card}>
            <Text>Order Summary</Text>
            <Text>Mounjaro 10mg - £229.00</Text>
            <Text>Mounjaro 7.5mg - £229.00</Text>
            <Text>Mounjaro 15mg - £245.00</Text>
            <Text style={styles.total}>Total: £703.00</Text>
          </View>
        )}

        <View style={styles.actions}>
          {currentStep > 0 && (
            <TouchableOpacity onPress={goBack}>
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={goNext}
            disabled={
              currentStep === 0 &&
              (!password || !confirmPassword || password !== confirmPassword)
            }
            style={[
              styles.nextButton,
              currentStep === 0 &&
                (!password || !confirmPassword || password !== confirmPassword) && {
                  opacity: 0.5,
                },
            ]}
          >
            <Text style={styles.nextText}>
              {currentStep === steps.length - 1 ? 'Submit' : 'Continue'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Loading Modal */}
        <Modal transparent visible={loading}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ActivityIndicator size="large" color="#4B0082" />
              <Text style={{ marginTop: 12 }}>Processing payment...</Text>
            </View>
          </View>
        </Modal>

        {/* Thank You Modal */}
        <Modal transparent visible={thankYou}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <Text style={styles.thankText}>Thank you!</Text>
              <Text>Your order has been placed.</Text>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EAF6FF',
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 13,
    color: '#333',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderColor: '#4B0082',
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4B0082',
  },
  tick: {
    color: '#fff',
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nextButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 12,
    borderRadius: 30,
    paddingHorizontal: 30,
    alignSelf: 'flex-end',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  backText: {
    color: '#4B0082',
    textDecorationLine: 'underline',
    alignSelf: 'center',
    marginTop: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    width: 250,
  },
  thankText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  total: {
    fontWeight: 'bold',
    marginTop: 12,
    fontSize: 16,
    color: '#4B0082',
  },
});
