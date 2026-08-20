import React, {useEffect} from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import useCartStore from '../store/useCartStore';
import GetImageIsUplaod from '../api/GetImageIsUplaod';
import NextButton from '../Components/NextButton';
import useImageUploadStore from '../store/useImageUploadStore';

const PaymentSuccess = () => {
  const {items, orderId, checkOut} = useCartStore();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {imageUploaded, setImageUploaded} = useImageUploadStore();

  useEffect(() => {
    if (!checkOut || Object.keys(checkOut).length === 0) {
      navigation.replace('dashboard');
    }
  }, [checkOut, navigation]);

  if (!checkOut || Object.keys(checkOut).length === 0) {
    return null;
  }

  useEffect(() => {
    const fetchImageStatus = async () => {
      try {
        const res = await GetImageIsUplaod({order_id: orderId});
        setImageUploaded(res?.data?.status);
      } catch (error) {
        console.error('Failed to fetch image status:', error);
      }
    };

    if (orderId) fetchImageStatus();
  }, [orderId]);

  const handleGoBack = () => {
    navigation.navigate('dashboard');
  };

  const handleGoUpload = () => {
    console.log('Upload photo');
    navigation.navigate('photo-upload');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16},
      ]}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="checkmark-circle" size={80} color="#6D28D9" />
          <Text style={styles.title}>Order Placed Successfully</Text>
          <Text style={styles.subtitle}>Order #{orderId}</Text>
        </View>

        {/* Order Summary Table */}
        <View style={styles.table}>
          {/* Header Row */}
          <View style={[styles.row, styles.tableHeader]}>
            <Text style={[styles.cell, styles.colItem]}>Items</Text>
            <Text style={[styles.cell, styles.colQty]}>Quantity</Text>
            <Text style={[styles.cell, styles.colAmount]}>Amount</Text>
          </View>

          {/* Doses */}
          {items?.doses?.map((item, index) => (
            <View key={`dose-${index}`} style={styles.row}>
              <Text style={[styles.cell, styles.colItem]}>
                {item?.product || item?.name || 'Add-on'}
              </Text>
              <Text style={[styles.cell, styles.colQty]}>{item?.qty}</Text>
              <Text style={[styles.cell, styles.colAmount]}>
                £{(parseFloat(item?.price) * (item?.qty || 1)).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Addons */}
          {items?.addons?.map((item, index) => (
            <View key={`addon-${index}`} style={styles.row}>
              <Text style={[styles.cell, styles.colItem]}>
                {item?.product || item?.name || 'Add-on'}
              </Text>
              <Text style={[styles.cell, styles.colQty]}>{item?.qty}</Text>
              <Text style={[styles.cell, styles.colAmount]}>
                £{(parseFloat(item?.price) * (item?.qty || 1)).toFixed(2)}
              </Text>
            </View>
          ))}

          {/* Discount */}
          {checkOut?.discount?.discount !== null && (
            <View style={styles.row}>
              <Text style={[styles.cell, styles.colItem]}>
                Discount
                {checkOut?.discount?.type && ` (${checkOut?.discount?.type})`}
                {checkOut?.discount?.code &&
                  ` - Code: ${checkOut?.discount?.code}`}
              </Text>
              <Text style={[styles.cell, styles.colQty]} />
              <Text style={[styles.cell, styles.colAmount]}>
                {checkOut?.discount?.type === 'percentage'
                  ? `${parseFloat(checkOut?.discount?.discount).toFixed(2)}%`
                  : `-£${parseFloat(checkOut?.discount?.discount).toFixed(2)}`}
              </Text>
            </View>
          )}

          {/* Shipping */}
          {checkOut?.shipment && (
            <View style={styles.row}>
              <Text style={[styles.cell, styles.colItem]}>
                Shipping ({checkOut?.shipment?.name})
              </Text>
              <Text style={[styles.cell, styles.colQty]} />
              <Text style={[styles.cell, styles.colAmount]}>
                £{parseFloat(checkOut?.shipment?.price).toFixed(2)}
              </Text>
            </View>
          )}

          {/* Total */}
          <View style={[styles.row, styles.totalRow]}>
            <Text style={[styles.cell, styles.colItem]}>Total</Text>
            <Text style={[styles.cell, styles.colQty]} />
            <Text style={[styles.cell, styles.colAmount]}>
              £{parseFloat(checkOut?.total).toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Blockquote */}
        <View style={styles.blockquote}>
          <Text style={styles.blockquoteTitle}>Photo Upload Request:</Text>
          <Text style={styles.blockquoteText}>
            To complete your order, please upload a clear, recent full-body
            photo as part of our prescription approval process. This helps our
            prescribers verify your BMI and ensure the safe and appropriate
            supply of your treatment.
          </Text>
          <Text style={styles.blockquoteText}>
            Once your photo has been reviewed and approved, your order will be
            processed and dispensed by our pharmacy.
          </Text>
          <Text style={styles.blockquoteText}>
            Your privacy is important to us — all photos are stored securely,
            encrypted, and handled in strict confidence in line with data
            protection regulations.
          </Text>
        </View>

        {/* Upload button */}
        {!imageUploaded && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleGoUpload}>
            <Ionicons name="warning" size={24} color="#000" />
            <Text style={styles.uploadButtonText}>
              Click here to upload your full-body image to complete your order
            </Text>
          </TouchableOpacity>
        )}

        {/* Extra info */}
        <View style={styles.section}>
          <Text style={{marginBottom: 15}}>
            <Text style={styles.bold}>Delivery:</Text> All orders, once
            approved, are shipped via next-day tracke d delivery using either
            DPD or Royal Mail. Orders may take longer than one working day to
            approve due to the clinical checks required. If you would like your
            order delivered on a specific date, please contact us before it is
            dispatched so we can send it accordingly.
          </Text>
          <Text>
            <Text style={styles.bold}>Changes or cancellation:</Text> If there
            are any changes you would like to make to your order or to cancel
            it, please contact us immediately by email on
            contact@mayfairweightlossclinic.co.uk. Please note that once your
            medication has been dispensed you will not be able to cancel or
            return your order. This is due to legislation around
            prescription-only medication.
          </Text>
        </View>

        {imageUploaded && (
          <NextButton
            onPress={handleGoBack}
            label="Continue to view order details"
          />
        )}
      </View>
    </ScrollView>
  );
};

export default PaymentSuccess;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2EEFF',
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    width: '100%',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginTop: 16,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  section: {
    marginVertical: 16,
  },
  /** TABLE FIX */
  table: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    marginVertical: 8,
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#F3F4F6',
  },
  cell: {
    fontSize: 14,
    color: '#374151',
  },
  colItem: {
    flex: 2, // wider column
  },
  colQty: {
    flex: 1,
    textAlign: 'center',
  },
  colAmount: {
    flex: 1,
    textAlign: 'right',
  },
  totalRow: {
    backgroundColor: '#F3F4F6',
  },
  blockquote: {
    backgroundColor: '#F9F9F9',
    borderLeftWidth: 3,
    borderRightWidth: 3,
    borderColor: '#ccc',
    borderRadius: 15,
    padding: 16,
    marginVertical: 16,
  },
  blockquoteTitle: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
    marginBottom: 8,
  },
  blockquoteText: {
    color: '#374151',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8d86e',
    borderRadius: 16,
    padding: 12,
    marginVertical: 16,
  },
  uploadButtonText: {
    marginLeft: 8,
    fontWeight: '600',
    color: '#000',
    flex: 1,
  },
  bold: {
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
