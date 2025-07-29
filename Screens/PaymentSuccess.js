import React from 'react';
import {View, Text, ScrollView, Linking, StyleSheet} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import useCartStore from '../store/useCartStore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import NextButton from '../Components/NextButton';

const PaymentSuccess = () => {
  const navigation = useNavigation();
  const {items, orderId, checkOut} = useCartStore();

  const handleGoBack = () => {
    navigation.navigate('dashboard');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        {/* Success Icon + Thank you */}
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={72} color="#6B21A8" />
          <Text style={styles.title}>Thank You!</Text>
          <Text style={styles.subTitle}>Order Placed Successfully</Text>
          <Text style={styles.orderId}>Order ID: #{orderId}</Text>
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          {items?.doses?.map((item, idx) => (
            <View key={`dose-${idx}`} style={styles.row}>
              <Text style={styles.label}>
                {item?.product} {item?.name}
              </Text>
              <Text style={styles.amount}>
                £{parseFloat(item?.price).toFixed(2)}
              </Text>
            </View>
          ))}

          {items?.addons?.map((item, idx) => (
            <View key={`addon-${idx}`} style={styles.row}>
              <Text style={styles.label}>
                {item?.product || item?.name || 'Add-on'}
              </Text>
              <Text style={styles.amount}>
                £{parseFloat(item?.price).toFixed(2)}
              </Text>
            </View>
          ))}

          {checkOut?.discount?.discount !== null && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Discount
                {checkOut?.discount?.type && ` (${checkOut?.discount?.type})`}
                {checkOut?.discount?.code &&
                  ` - Code: ${checkOut?.discount?.code}`}
              </Text>
              <Text style={styles.amount}>
                -£{parseFloat(checkOut?.discount?.discount).toFixed(2)}
              </Text>
            </View>
          )}

          {checkOut?.shipment && (
            <View style={styles.row}>
              <Text style={styles.label}>
                Shipping ({checkOut?.shipment?.name})
              </Text>
              <Text style={styles.amount}>
                £{parseFloat(checkOut?.shipment?.price).toFixed(2)}
              </Text>
            </View>
          )}

          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalAmount}>
              £{parseFloat(checkOut?.total).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.description}>
          <Text style={styles.text}>
            We have received your medical consultation form which is now being
            reviewed by our prescribers. You may be contacted by a member of our
            medical team for more information prior to your medication being
            dispensed. Details of your order have been emailed to you and is
            also available to view on the "my orders" section of your account.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Delivery:</Text> All orders, once
            approved, are shipped via next-day tracked delivery using either DPD
            or Royal Mail. Orders may take longer than one working day to
            approve due to the clinical checks required. If you would like your
            order delivered on a specific date, please contact us before it is
            dispatched so we can send it accordingly.
          </Text>

          <Text style={styles.text}>
            <Text style={styles.bold}>Changes or cancellation:</Text> If there
            are any changes you would like to make to your order or to cancel
            it, please contact us immediately by email on{' '}
            <Text
              style={styles.link}
              onPress={() =>
                Linking.openURL('mailto:contact@mayfairweightlossclinic.co.uk')
              }>
              contact@mayfairweightlossclinic.co.uk
            </Text>{' '}
            Please note that once your medication has been dispensed you will
            not be able to cancel or return your order. This is due to
            legislation around prescription-only medication.
          </Text>
        </View>

        {/* Button */}
        <NextButton
          onPress={handleGoBack}
          label="Continue to View Order Details"
        />
      </View>
    </ScrollView>
  );
};

export default PaymentSuccess;
const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#F3F0FF',
    flexGrow: 1,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B0082',
    marginTop: 10,
    textAlign: 'center',
  },
  subTitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
    textAlign: 'center',
  },
  orderId: {
    fontSize: 16,
    color: '#777',
    marginTop: 8,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#333',
  },
  summary: {
    marginVertical: 20,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    fontSize: 15,
    color: '#333',
  },
  amount: {
    fontSize: 15,
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    marginTop: 12,
    paddingTop: 12,
  },
  totalLabel: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  totalAmount: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#000',
  },
  description: {
    marginVertical: 20,
  },
  text: {
    fontSize: 14,
    color: '#555',
    marginBottom: 10,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
    color: '#000',
    textDecorationLine: 'underline',
  },
  link: {
    color: '#6B21A8',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
