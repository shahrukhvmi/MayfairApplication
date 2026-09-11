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
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useSignupStore from '../store/signupStore';
import useProductId from '../store/useProductIdStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useCheckoutStore from '../store/checkoutStore';
import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';
import useLastBmi from '../store/useLastBmiStore';
import useUserDataStore from '../store/userDataStore';
import useAbandonCardStore from '../store/useAbandonCardStore';
import {useMutation} from '@tanstack/react-query';
import {normalizeConfirmationInfo} from '../utils/normalizeConfirmationInfo';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const OrderSummary = ({isNextDisabled}) => {
  const navigation = useNavigation();

  const [discountCode, setDiscountCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);

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
  const {confirmationQuestions} = useConfirmationQuestionsStore();
  const {email} = useSignupStore();
  const {productId, clearProductId} = useProductId();
  const {clearAuthUserDetail} = useAuthUserDetailStore();
  const {clearCheckout} = useCheckoutStore();
  const {clearMedicalQuestions} = useMedicalQuestionsStore();
  const {clearToken} = useAuthStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {clearLastBmi} = useLastBmi();
  const {clearUserData} = useUserDataStore();
  const {abandonCard, clearAbandonCard} = useAbandonCardStore();
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
      const res = await CouponApi({
        coupon_code: discountCode,
        product_id: productId,
        variant_ids: items?.doses?.map(item => item?.item_id),
      });
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

  const checkoutMutation = useMutation(sendStepData, {
    onSuccess: data => {
      if (data) {
        setOrderId(data?.data?.paymentData?.order_id);
        clearCoupon();
        clearAbandonCard();
        setLoading(false);
        setTimeout(() => {
          Alert.alert(
            'Leave App?',
            'You will be redirected to a secure external payment page.',
            [
              {text: 'Cancel', style: 'cancel'},
              {
                text: 'Continue',
                onPress: () =>
                  Linking.openURL(
                    'https://mayfair-staging.netlify.app/payment/?order_id=' +
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
      const response = error?.response?.data;
      const errors = response?.original?.errors;
      const productError = response?.errors?.Product;
      const outOfStock = response?.errors?.OutOfStock;

      if (response?.message === 'Unauthenticated.') {
        Toast.show({type: 'error', text1: 'Session Expired'});
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
        Object.entries(errors).forEach(([, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => Toast.show({type: 'error', text1: msg}));
          } else {
            Toast.show({type: 'error', text1: messages});
          }
        });
      } else if (outOfStock && typeof outOfStock === 'object') {
        Object.entries(outOfStock).forEach(([, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach(msg => Toast.show({type: 'error', text1: msg}));
          } else {
            Toast.show({type: 'error', text1: messages});
          }
        });
        navigation.navigate('gathering-data');
      } else if (outOfStock && typeof outOfStock !== 'object') {
        Toast.show({type: 'error', text1: outOfStock});
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
      type: abandonCard?.type ? abandonCard?.type : null,
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

    const resolvedPid = productId || abandonCard?.productId;

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
      pid: resolvedPid,
      medicalInfo,
      gpdetails,
      bmi,
      confirmationInfo: normalizeConfirmationInfo(
        confirmationInfo,
        confirmationQuestions,
      ),
      reorder_concent: null,
      product_id: resolvedPid,
      client_type: 'mobile',
    };

    checkoutMutation.mutate(formData);
  };

  const renderItem = (item, idx) => {
    if (item.type === 'dose') {
      return (
        <React.Fragment key={idx}>
          <View style={styles.itemRow}>
            <View style={{flex: 1}}>
              <Text style={styles.itemTitle}>{item.product}</Text>
              <Text style={styles.itemQuantity}>Qty x{item.qty}</Text>
            </View>
            <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
          </View>

          {item.product === 'Mounjaro (Tirzepatide)' && (
            <View style={styles.itemRow}>
              <View style={{flex: 1}}>
                <Text style={styles.itemTitle}>Pack of 5 Needles</Text>
                <Text style={styles.itemQuantity}>Qty x{item.qty}</Text>
              </View>
              <Text style={styles.itemPrice}>£0.00</Text>
            </View>
          )}
        </React.Fragment>
      );
    }

    return (
      <View style={styles.itemRow} key={idx}>
        <View style={{flex: 1}}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemQuantity}>Qty x{item.qty}</Text>
        </View>
        <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
      </View>
    );
  };

  const renderAddon = (item, idx) => (
    <View style={styles.itemRow} key={idx}>
      <View style={{flex: 1}}>
        <Text style={styles.itemTitle}>{item.product}</Text>
        <Text style={styles.itemQuantity}>Qty x{item.qty}</Text>
      </View>
      <Text style={styles.itemPrice}>£{item.price.toFixed(2)}</Text>
    </View>
  );

  return (
    <>
      <View style={styles.headerRow}>
        <Text style={styles.sectionSubtitle}>
          Review your items before payment
        </Text>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <Feather name="edit-2" size={13} color={PRIMARY} />
          <Text style={styles.editText}>Edit</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {items.doses?.map(renderItem)}
        {items.addons?.map(renderAddon)}
      </View>

      <View style={styles.summaryBlock}>
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
            <Text style={[styles.summaryLabel, {color: PRIMARY}]}>
              Discount
            </Text>
            <Text style={[styles.summaryValue, {color: PRIMARY}]}>
              -£{discountAmount.toFixed(2)}
            </Text>
          </View>
        )}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>
            Shipping ({shipping?.country_name})
          </Text>
          <Text style={styles.summaryValue}>£{shipping?.country_price}</Text>
        </View>

        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>£{finalTotal.toFixed(2)}</Text>
        </View>

        {Coupon ? (
          <View style={styles.couponApplied}>
            <View style={{flex: 1}}>
              <Text style={styles.couponAppliedText}>
                {Coupon?.Data?.code} Applied
              </Text>
              <Text style={styles.couponAppliedSub}>
                - £{Coupon?.Data?.discount}
                {Coupon?.Data?.type === 'Percent' &&
                  ` (${Coupon?.Data?.discount}% off)`}
              </Text>
            </View>
            <TouchableOpacity onPress={handleRemoveCoupon}>
              <Feather name="x" size={18} color="#059669" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.couponRow}>
            <TextInput
              style={styles.couponInput}
              placeholder="Enter discount code"
              placeholderTextColor="#94a3b8"
              value={discountCode}
              onChangeText={setDiscountCode}
            />
            <TouchableOpacity
              style={[
                styles.couponButton,
                !isApplyEnabled && styles.couponButtonDisabled,
              ]}
              onPress={handleApplyCoupon}
              disabled={!isApplyEnabled}>
              <Text style={styles.couponButtonText}>
                {couponLoading ? 'Applying...' : 'Apply'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <NextButton
        label="Proceed to Payment"
        onPress={handleSubmit}
        disabled={!isNextDisabled}
        style={styles.submitButton}
      />

      <Modal transparent visible={loading}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <ActivityIndicator size="large" color={PRIMARY} />
            <Text style={styles.modalText}>Processing payment...</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  editText: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },

  itemsList: {
    gap: 8,
    marginBottom: 16,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#FBFBFD',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  itemTitle: {
    fontSize: 13.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  itemQuantity: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#94a3b8',
    marginTop: 2,
  },
  itemPrice: {
    fontSize: 13.5,
    fontFamily: Fonts.semiBold,
    color: '#334155',
  },

  summaryBlock: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#64748b',
  },
  summaryValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#334155',
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f5f2fc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 17,
    fontFamily: Fonts.bold,
    color: PRIMARY,
  },

  couponApplied: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    backgroundColor: '#ecfdf5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  couponAppliedText: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#047857',
  },
  couponAppliedSub: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#059669',
    marginTop: 2,
  },
  couponRow: {
    flexDirection: 'row',
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#0f172a',
    backgroundColor: '#fff',
  },
  couponButton: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  couponButtonDisabled: {
    backgroundColor: '#c8c1da',
  },
  couponButtonText: {
    color: '#fff',
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
  },

  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
    marginTop: 18,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalBox: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 18,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginTop: 12,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
});

export default OrderSummary;
