import {useNavigation} from '@react-navigation/native';
import {useRef, useState} from 'react';
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
import OrderSummary from '../Components/OrderSummary';

export default function CheckoutSteps() {
  const scrollRef = useRef();
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [shippingCheckbox, setShippingCheckbox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const navigation = useNavigation();
  const [showNextSteps, setShowNextSteps] = useState(false); // ADD THIS
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    if (!password || !confirmPassword) {
      alert('Please fill in both password fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
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
      <ScrollView style={styles.container} ref={scrollRef}>
        <Text style={styles.heading}>Complete Your Checkout</Text>

        {/* Step 1: Password */}
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

          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => {
              if (!password || !confirmPassword) {
                alert('Please fill in both password fields.');
                return;
              }
              if (password !== confirmPassword) {
                alert('Passwords do not match.');
                return;
              }
              setShowNextSteps(true);
              // setTimeout(() => {
              //   scrollRef.current?.scrollToEnd({animated: true});
              // }, 200);
            }}>
            <Text style={styles.nextText}>Set Password</Text>
          </TouchableOpacity>
        </View>

        {showNextSteps && (
          <>
            {/* Step 2: Shipping */}
            <View style={styles.card}>
              <Text style={styles.subHeading}>Shipping Address</Text>
              <TextFields label="First Name" placeholder="First Name" />
              <TextFields label="Last Name" placeholder="Last Name" />
              <TextFields label="Country" placeholder="Country" />
              <TextFields label="Postcode" placeholder="Postcode" />
              <TextFields label="Street Address" placeholder="Street Address" />
              <TextFields label="City" placeholder="City" />
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setShippingCheckbox(!shippingCheckbox)}>
                <View
                  style={[
                    styles.checkbox,
                    shippingCheckbox && styles.checkedBox,
                  ]}>
                  {shippingCheckbox && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={{marginLeft: 10, fontSize: 14}}>
                  Make billing address same as shipping address
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 3: Billing */}
            <View style={styles.card}>
              <Text style={styles.subHeading}>Blling Address</Text>
              <TextFields label="Country" placeholder="Country" />
              <TextFields label="Postcode" placeholder="Postcode" />
              <TextFields label="Address" placeholder="Address" />
              <TextFields label="City" placeholder="City" />
              <TextFields label="State / County" placeholder="State / County" />
            </View>

            {/* Step 4: Consent */}
            <View style={styles.card}>
              <Text style={styles.subHeading}>Treatment Consent</Text>
              <Text style={styles.paragraphExplain}>
                Please review the important information below regarding your
                treatment:
              </Text>
              <Text style={styles.paragraph}>
                • If you are ordering a higher dose of Mounjaro, you have
                started on the low doses and have titrated up to the higher
                dose.
              </Text>
              <Text style={styles.paragraph}>
                • Mounjaro is once-weekly injections should be taken ONCE a week
                on the same day each week.
              </Text>
              <Text style={styles.paragraph}>
                • Mounjaro should be stored in the fridge when not in use (2°C
                to 8°C). It may be stored unrefrigerated for up to 30 days at a
                temperature not above 30 °C and then the pen must be discarded.
              </Text>
              <Text style={styles.paragraph}>
                • If you are a woman of childbearing age, you will take any
                necessary precautions to ensure that you do not get pregnant
                while using this medication or for two months after stopping the
                treatment as the effects of this medicine on an unborn child are
                not known.
              </Text>
              <Text style={styles.paragraph}>
                • If you are a woman with obesity or overweight and are using
                oral contraceptives, you should consider also using a barrier
                method of contraception (e.g., a condom) or switching to a
                non-oral contraceptive method for 4 weeks after starting
                Mounjaro and for 4 weeks after each increase in dose.
              </Text>
              <Text style={styles.paragraph}>
                • I confirm that I have read and understood the Patient
                Information Leaflet.
              </Text>
              <Text style={styles.paragraph}>
                • I confirm that I have read, understood and accept Mayfair
                Weight Loss Clinic’s Terms and Conditions.
              </Text>
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => setIsChecked(!isChecked)}>
                <View style={[styles.checkbox, isChecked && styles.checkedBox]}>
                  {isChecked && <Text style={styles.tick}>✓</Text>}
                </View>
                <Text style={{marginLeft: 10, fontSize: 14}}>
                  I accept all terms and conditions
                </Text>
              </TouchableOpacity>
            </View>

            {/* Step 5: Summary */}
            <View style={styles.card}>
              <OrderSummary />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              style={styles.submitButton}>
              <Text style={styles.submitText}>Procceed to Payment</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Loading Modal */}
        <Modal transparent visible={loading}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <ActivityIndicator size="large" color="#4B0082" />
              <Text style={{marginTop: 12}}>Processing payment...</Text>
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
    backgroundColor: '#F5F9FF',
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
    textAlign: 'center',
  },
  subHeading: {
    textAlign: 'left',
    color: '#1A1A1A',
    marginBottom: 16,
    fontSize: 20,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
  paragraphExplain: {
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 14,
    color: '#444',
    lineHeight: 22,
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderColor: '#4B0082',
    borderWidth: 2,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#4B0082',
  },
  tick: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    alignItems: 'center',
  },
  nextButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  nextText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  backText: {
    color: '#4B0082',
    fontWeight: '500',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    width: '80%',
  },
  thankText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 8,
  },
  total: {
    fontWeight: 'bold',
    marginTop: 16,
    fontSize: 18,
    color: '#4B0082',
  },
  submitButton: {
    backgroundColor: '#4B0082',
    paddingVertical: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  submitText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  thankYouText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4B0082',
    marginBottom: 8,
  },
});
