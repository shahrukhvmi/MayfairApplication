import { useNavigation } from '@react-navigation/native';
import { useRef, useState } from 'react';
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
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import BillingAddress from '../Components/BillingAddress';
import ProductConsent from '../Components/ProductConsent';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import ShippingAddress from '../Components/ShippingAddress';
import NextButton from '../Components/NextButton';

export default function CheckoutSteps() {
  const scrollRef = useRef();
  const [formData, setFormData] = useState({});
  const [isChecked, setIsChecked] = useState(false);
  const [isShippingCheck, setIsShippingCheck] = useState(false);
  const [isBillingCheck, setIsBillingCheck] = useState(false);
  const [isConcentCheck, setIsConcentCheck] = useState(false);
  const { billingSameAsShipping } = useShippingOrBillingStore();

  const [loading, setLoading] = useState(false);
  const [thankYou, setThankYou] = useState(false);

  const navigation = useNavigation();

  console.log(isShippingCheck, 'isShippingCheck');
  console.log(isBillingCheck, 'isBillingCheck');

  const isNextDisabled = isShippingCheck && isBillingCheck && isConcentCheck;

  console.log(isNextDisabled, 'isNextDisabled');

  return (
    <>
      <Header />
      <ScrollView style={styles.container} ref={scrollRef}>
        <Text style={styles.heading}>Checkout to kick-start your weight loss journey</Text>


        <>
          {/* Step 2: Shipping */}
          <ShippingAddress setIsShippingCheck={setIsShippingCheck} />

          {/* Step 3: Billing */}
          {!billingSameAsShipping && (
            <BillingAddress setIsBillingCheck={setIsBillingCheck} />
          )}

          {/* Step 4: Consent */}
          <ProductConsent
            setIsConcentCheck={setIsConcentCheck}
            isCompleted={setIsConcentCheck}
          />

          {/* Step 5: Summary */}
          <OrderSummary isNextDisabled={isNextDisabled} />

          {/* <TouchableOpacity
            onPress={handleSubmit}
            style={styles.submitButton}
            disabled={true}>
            <Text style={styles.submitText}>Procceed to Payment</Text>
          </TouchableOpacity> */}
        </>

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
    backgroundColor: '#F5F9FF',
    padding: 16,
    flex: 1,
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 18,
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
    shadowOffset: { width: 0, height: 2 },
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
  disabled: {
    backgroundColor: '#aaa',
  },
});
