import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import Entypo from 'react-native-vector-icons/Entypo';
import {useNavigation} from '@react-navigation/native';
import useCartStore from '../store/useCartStore';
import useCouponStore from '../store/couponStore';
import Toast from 'react-native-toast-message';
import {CouponApi} from '../api/couponApi';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import NextButton from './NextButton';

const OrderSummary = ({isNextDisabled}) => {
  const navigation = useNavigation();

  const [loading, setLoading] = useState(false);
  const [thankYou, setThankYou] = useState(false);

  const {items, totalAmount, setCheckOut, setOrderId} = useCartStore();
  const {Coupon, setCoupon, clearCoupon} = useCouponStore();
  const {
    shipping,
    billing,
    billingSameAsShipping,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();

  const [discountCode, setDiscountCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  let discountAmount = 0;
  let shippingPrice = Number(shipping?.country_price) || 0;
  let finalTotal = totalAmount + shippingPrice;

  if (Coupon?.Data?.type === 'Percent') {
    discountAmount = (totalAmount / 100) * Coupon?.Data?.discount;
  } else {
    discountAmount = Coupon?.Data?.discount || 0;
  }

  if (discountAmount) {
    finalTotal = totalAmount - discountAmount + shippingPrice;
  }

  const isApplyEnabled = discountCode.trim().length > 0;

  const handleEdit = () => {
    navigation.navigate('dose-selection');
  };

  const handleApplyCoupon = async () => {
    setCouponLoading(true);
    try {
      const res = await CouponApi({coupon_code: discountCode});
      if (res?.data?.status === true) {
        Toast.show({type: 'success', text1: 'Coupon applied successfully!'});
        setCoupon(res.data);
        setDiscountCode('');
      }
    } catch (error) {
      const err = error?.response?.data?.errors?.Coupon;
      if (err) {
        Toast.show({type: 'error', text1: err});
        clearCoupon();
      } else {
        Toast.show({type: 'error', text1: 'Something went wrong'});
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    clearCoupon();
    Toast.show({type: 'info', text1: 'Coupon removed'});
  };

  const handleSubmit = () => {
    // if (!isChecked) {
    //   alert('Please confirm the consent.');
    //   return;
    // }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setThankYou(true);

      setTimeout(() => {
        setThankYou(false);
        navigation.navigate('dashboard');
      }, 1500);
    }, 2000);
  };

  const renderItem = (item, idx) => {
    if (item.type === 'dose') {
      return (
        <React.Fragment key={idx}>
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.product}</Text>
              <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
          </View>
          {item.product === 'Mounjaro (Tirzepatide)' && (
            <View style={[styles.itemContainer, styles.mounjaroContainer]}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>Pack of 5 Needle</Text>
                <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>£0.00</Text>
            </View>
          )}
        </React.Fragment>
      );
    }

    return (
      <View style={styles.itemContainer} key={idx}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Quantity: x{item.qty}</Text>
        </View>
        <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
      </View>
    );
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Text style={styles.sectionTitle}>Order Summary</Text>
            <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
              <Text style={styles.editText}>Edit order</Text>
              <Feather name="edit" size={24} color="#47317c" />
            </TouchableOpacity>
          </View>

          {items.doses?.map(renderItem)}

          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>£{totalAmount.toFixed(2)}</Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>VAT</Text>
              <Text style={styles.summaryValue}>£0.00</Text>
            </View>

            {Coupon && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, {color: '#47317c'}]}>
                  Discount
                </Text>
                <Text style={[styles.summaryValue, {color: '#47317c'}]}>
                  -£{discountAmount.toFixed(2)}
                </Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>
                Shipping ({shipping?.country_name})
              </Text>
              <Text style={styles.summaryValue}>
                £{shipping?.country_price}
              </Text>
            </View>

            <View style={styles.separator} />

            <View style={styles.summaryRow}>
              <Text style={styles.summaryTitle}>Total</Text>
              <Text style={styles.summaryTitle}>£{finalTotal.toFixed(2)}</Text>
            </View>

            <View style={styles.separator} />

            {/* Discount Message */}
            {Coupon && (
              <View style={styles.discountSection}>
                <View>
                  <Text style={styles.discountText}>
                    {Coupon?.Data?.code} Applied
                  </Text>
                  <Text style={styles.discountAmount}>
                    - £{Coupon?.Data?.discount}{' '}
                    {Coupon?.Data?.type === 'Percent' &&
                      `(${Coupon?.Data?.discount}% off)`}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={handleRemoveCoupon}>
                  <Entypo name="cross" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            )}

            {/* Apply Coupon */}
            {!Coupon && (
              <View style={styles.applyCouponContainer}>
                <TextInput
                  style={styles.couponInput}
                  placeholder="Enter discount code"
                  value={discountCode}
                  onChangeText={setDiscountCode}
                />
                <TouchableOpacity
                  style={[
                    styles.applyCouponButton,
                    {backgroundColor: isApplyEnabled ? '#4B0082' : '#ccc'},
                  ]}
                  onPress={handleApplyCoupon}
                  disabled={!isApplyEnabled}>
                  <Text style={styles.applyCouponButtonText}>
                    {couponLoading ? 'Applying...' : 'Apply'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      <NextButton
        label="Procceed to Payment"
        style={{marginBottom: 30}}
        onPress={handleSubmit}
        disabled={!isNextDisabled}
      />

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
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    marginRight: 8,
    fontSize: 14,
    color: '#47317c',
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#F2EEFF',
    marginBottom: 8,
    borderRadius: 8,
  },
  mounjaroContainer: {
    backgroundColor: '#ececec',
  },
  itemDetails: {
    flexDirection: 'column',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f1f1f',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6b6b6b',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  summaryContainer: {
    marginTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#000',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  discountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#1f9e8c',
    borderRadius: 8,
    marginTop: 16,
  },
  discountDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  discountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  discountAmount: {
    color: '#fff',
    fontSize: 14,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  applyCouponContainer: {
    flexDirection: 'row',
    marginTop: 16,
  },
  couponInput: {
    flex: 1,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },
  applyCouponButton: {
    padding: 8,
    backgroundColor: '#4B0082',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  applyCouponButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  paymentButtonContainer: {
    marginTop: 16,
  },
  paymentButton: {
    padding: 16,
    backgroundColor: '#1f9e8c',
    borderRadius: 8,
    alignItems: 'center',
  },
  paymentButtonText: {
    fontSize: 18,
    color: '#fff',
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
});

export default OrderSummary;
