import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
  Alert,
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
import sendStepData from '../api/stepsDataApi';
import usePatientInfoStore from '../store/patientInfoStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import useGpDetailsStore from '../store/gpDetailStore';
import useBmiStore from '../store/bmiStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import useSignupStore from '../store/signupStore';
import useProductId from '../store/useProductIdStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useCheckoutStore from '../store/checkoutStore';
import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';
import useLastBmi from '../store/useLastBmiStore';
import useUserDataStore from '../store/userDataStore';
import {useMutation} from '@tanstack/react-query';

const OrderSummary = ({isNextDisabled}) => {
  const navigation = useNavigation();

  /*___________________  Local state_____________________________*/

  const [discountCode, setDiscountCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [paymentData, setPaymentData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [thankYou, setThankYou] = useState(false);

  /*___________________  Zustand state_____________________________*/

  const {items, totalAmount, setCheckOut, setOrderId} = useCartStore();
  const {Coupon, setCoupon, clearCoupon} = useCouponStore();
  const {
    shipping,
    billing,
    billingSameAsShipping,
    clearShipping,
    clearBilling,
  } = useShippingOrBillingStore();
  const {patientInfo, clearPatientInfo} = usePatientInfoStore();
  const {medicalInfo, clearMedicalInfo} = useMedicalInfoStore();
  const {gpdetails, clearGpDetails} = useGpDetailsStore();
  const {bmi, clearBmi} = useBmiStore();
  const {confirmationInfo, clearConfirmationInfo} = useConfirmationInfoStore();
  const {email} = useSignupStore();
  const {productId, clearProductId} = useProductId();

  console.log(email, 'email from OrderSummary');

  // store addons or dose here 🔥🔥

  const {clearAuthUserDetail} = useAuthUserDetailStore();

  const {clearCheckout} = useCheckoutStore();
  const {clearMedicalQuestions} = useMedicalQuestionsStore();
  const {clearConfirmationQuestions} = useConfirmationQuestionsStore();

  const {clearToken} = useAuthStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {clearLastBmi} = useLastBmi();
  const {clearUserData} = useUserDataStore();

  const {clearFirstName, clearLastName, clearEmail, clearConfirmationEmail} =
    useSignupStore();

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

  /* ______________________ 💳 Payment API Integration ______________________ */

  const checkoutMutation = useMutation(sendStepData, {
    onSuccess: data => {
      if (data) {
        setPaymentData(data?.data?.paymentData);
        setOrderId(data?.data?.paymentData?.order_id);
        clearCoupon();
        setLoading(false);
        setTimeout(() => {
          Alert.alert(
            'Leave App?',
            'You will be redirected to a secure external payment page.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Continue',
                onPress: () =>
                  Linking.openURL(
                    'https://mayfair-revamp.netlify.app/payment/?order_id=' +
                      data?.data?.paymentData?.order_token,
                  ).catch(err => console.warn('Failed to open browser:', err)),
              },
            ],
            {cancelable: true},
          );
        }, 300);
      }
    },
    onError: error => {
      console.log('Checkout Error:', error);

      const response = error?.response?.data;
      const errors = response?.original?.errors;
      const productError = response?.errors?.Product;
      const outOfStock = response?.errors?.OutOfStock;

      if (response?.message === 'Unauthenticated.') {
        Toast.show({type: 'error', text1: 'Session Expired'});

        // Clear all user and session-related data
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
        clearMedicalQuestions();
        clearConfirmationQuestions();
        clearToken();
        clearProductId();
        clearLastBmi();
        clearUserData();
        clearFirstName();
        clearLastName();
        clearEmail();
        clearConfirmationEmail();

        setIsPasswordReset(true);
        setLoading(false);
        navigation.navigate('Login');
        return;
      }

      setLoading(false);

      if (errors && typeof errors === 'object') {
        Object.entries(errors).forEach(([_, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => Toast.show({type: 'error', text1: msg}));
          } else {
            Toast.show({type: 'error', text1: messages});
          }
        });
      } else if (outOfStock && typeof outOfStock === 'object') {
        Object.entries(outOfStock).forEach(([_, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => Toast.show({type: 'error', text1: msg}));
          } else {
            Toast.show({type: 'error', text1: messages});
          }
        });
        navigation.navigate('gathering-data');
      } else if (outOfStock && typeof outOfStock !== 'object') {
        Toast.show({type: 'error', text1: outOfStock});
        console.log('From single OutOfStock');
        navigation.navigate('gathering-data');
      } else {
        Toast.show({
          type: 'error',
          text1: productError || 'Something went wrong',
        });
      }
    },
  });

  const handleRemoveCoupon = () => {
    clearCoupon();
    Toast.show({type: 'info', text1: 'Coupon removed'});
  };

  const handleSubmit = () => {
    setLoading(true);
    const checkout = {
      firstName: shipping?.first_name,
      lastName: shipping?.last_name,
      email: email,
      phoneNo: patientInfo?.phoneNo,
      shipping: {
        postalcode: shipping?.postalcode,
        addressone: shipping?.addressone,
        addresstwo: shipping?.addresstwo,
        city: shipping?.city,
        state: shipping?.state,
        country: shipping?.country_name,
      },
      terms: true,
      sameAddress: billingSameAsShipping,
      billing: {
        postalcode: billing?.postalcode,
        addressone: billing?.addressone,
        addresstwo: billing?.addresstwo,
        city: billing?.city,
        state: billing?.state,
        country: billing?.country_name,
      },
      discount: {
        code: Coupon?.Data?.code ? Coupon?.Data?.code : null,
        discount: Coupon?.Data?.discount ? Coupon?.Data?.discount : null,
        type: Coupon?.Data?.type ? Coupon?.Data?.type : null,
        discount_value: discountAmount ? discountAmount : null,
      },
      subTotal: parseFloat(totalAmount),
      total: parseFloat(finalTotal),
      shipment: {
        id: shipping?.id,
        name: shipping?.country_name,
        price: parseFloat(shipping?.country_price),
        status: 1,
        taggable_type: 'App\\Models\\Product',
        taggable_id: '1',
      },
    };

    setCheckOut(checkout);

    const formData = {
      checkout,
      patientInfo,
      items: (items?.doses || []).map(d => ({
        ...d,
        quantity: d.quantity || d.qty || 1,
      })),
      addons: (items?.addons || []).map(a => ({
        ...a,
        quantity: a.quantity || a.qty || 1,
      })),
      pid: productId,
      medicalInfo,
      gpdetails,
      bmi,
      confirmationInfo,
      reorder_concent: null,
      product_id: productId,
    };

    checkoutMutation.mutate(formData);
    // console.log(JSON.stringify(formData, null, 2), 'Form Data for Checkout');
  };

  console.log(paymentData, 'paymentData 😋😋😋');

  const renderItem = (item, idx) => {
    if (item.type === 'dose') {
      return (
        <React.Fragment key={idx}>
          <View style={styles.itemContainer}>
            <View style={styles.itemDetails}>
              <Text style={styles.itemTitle}>{item.product}</Text>
              <Text style={styles.itemQuantity}>Qty: x{item.qty}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceText}>£{item.price.toFixed(2)}</Text>
            </View>
          </View>

          {item.product === 'Mounjaro (Tirzepatide)' && (
            <View style={[styles.itemContainer]}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemTitle}>Pack of 5 Needles</Text>
                <Text style={styles.itemQuantity}>Qty: x{item.qty}</Text>
              </View>
              <View style={styles.priceBadge}>
                <Text style={styles.priceText}>£0.00</Text>
              </View>
            </View>
          )}
        </React.Fragment>
      );
    }

    return (
      <View style={styles.itemContainer} key={idx}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Qty: x{item.qty}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>£{item.price.toFixed(2)}</Text>
        </View>
      </View>
    );
  };

  const renderAddon = (item, idx) => {
    return (
      <View style={styles.itemContainer} key={idx}>
        <View style={styles.itemDetails}>
          <Text style={styles.itemTitle}>{item.product}</Text>
          <Text style={styles.itemQuantity}>Qty: x{item.qty}</Text>
        </View>
        <View style={styles.priceBadge}>
          <Text style={styles.priceText}>£{item.price.toFixed(2)}</Text>
        </View>
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
          {items.addons?.map(renderAddon)}

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
                  placeholderTextColor={'#000'}
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
        // disabled={!isNextDisabled}
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
    padding: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    color: '#000',
    position: 'relative',
  },
  applyCouponButton: {
    padding: 8,
    paddingHorizontal: 16,
    backgroundColor: '#4B0082',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    right: 10,
    top: 10,
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

  priceBadge: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
  },

  priceText: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
});

export default OrderSummary;
