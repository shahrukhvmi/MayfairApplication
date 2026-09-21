import React, {useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

import useProductId from '../store/useProductIdStore';
import useReorder from '../store/useReorderStore';
import useBmiStore from '../store/bmiStore';
import useCheckoutStore from '../store/checkoutStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import useGpDetailsStore from '../store/gpDetailStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import usePatientInfoStore from '../store/patientInfoStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useLastBmi from '../store/useLastBmiStore';
import useCouponStore from '../store/couponStore';
import useSignupStore from '../store/signupStore';
import userConsultationApi from '../api/consultationApi';
import useReturning from '../store/useReturningPatient';
import useAbandonCardStore from '../store/useAbandonCardStore';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const ProductCard = ({
  id,
  title,
  image,
  price,
  status,
  buttonText,
  lastOrderDate,
  reorder = false,
}) => {
  const navigation = useNavigation();
  const {setProductId} = useProductId();
  const {setReorder} = useReorder();
  const {clearCoupon} = useCouponStore();

  const {setBmi, clearBmi} = useBmiStore();
  const {setCheckout, clearCheckout} = useCheckoutStore();
  const {setConfirmationInfo, clearConfirmationInfo} =
    useConfirmationInfoStore();
  const {setGpDetails, clearGpDetails} = useGpDetailsStore();
  const {setMedicalInfo, clearMedicalInfo} = useMedicalInfoStore();
  const {setPatientInfo, clearPatientInfo} = usePatientInfoStore();
  const {setAuthUserDetail, clearAuthUserDetail} = useAuthUserDetailStore();
  const {setShipping, clearShipping, setBilling, clearBilling} =
    useShippingOrBillingStore();
  const {setLastBmi} = useLastBmi();
  const {setFirstName, setLastName} = useSignupStore();
  const {setIsReturningPatient} = useReturning();
  const {clearAbandonCard} = useAbandonCardStore();

  const [loading, setLoading] = useState(false);

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: data => {
      console.log(data, 'Dataaaaaaaaaa');

      if (data?.data?.data == null) {
        console.log('true');
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
      } else if (data?.data) {
        setBmi(data?.data?.data?.bmi);
        setCheckout(data?.data?.data?.checkout);
        setConfirmationInfo(data?.data?.data?.confirmationInfo);
        setGpDetails(data?.data?.data?.gpdetails);
        setMedicalInfo(data?.data?.data?.medicalInfo);
        setPatientInfo(data?.data?.data?.patientInfo);
        setShipping(data?.data?.data?.shipping);
        setBilling(data?.data?.data?.billing);
        setAuthUserDetail(data?.data?.data?.auth_user);
        setLastBmi(data?.data?.data?.bmi);
        setFirstName(data?.data?.data?.patientInfo?.firstName);
        setLastName(data?.data?.data?.patientInfo?.lastName);
        setIsReturningPatient(data?.data?.data?.isReturning);
      }

      if (reorder) {
        navigation.navigate('re-order');
        setReorder(true);
        clearCoupon();
      } else {
        setReorder(false);
        navigation.navigate('Acknowledgment');
      }

      setLoading(false);
      return;
    },
    onError: error => {
      console.log('error', error?.response?.data?.errors?.email);
      if (error) {
        setLoading(false);
      }
    },
  });

  const handlePress = () => {
    clearAbandonCard();
    setProductId(id);
    setLoading(true);
    const formData = {
      clinic_id: 1,
      product_id: id,
    };
    consultationMutation.mutate(formData);
  };

  const disabled = status === false;

  return (
    <View style={[styles.card, disabled && styles.cardDisabled]}>
      {/* Top row: image, name, price */}
      <View style={styles.topRow}>
        <View style={styles.imageBox}>
          {disabled && (
            <View style={styles.outOfStockOverlay}>
              <Text style={styles.outOfStockBadge}>Out of stock</Text>
            </View>
          )}
          {image ? (
            <Image
              key={image}
              source={{uri: image}}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.imagePlaceholderText}>No Image</Text>
            </View>
          )}
        </View>

        <View style={styles.titleWrap}>
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>
          {lastOrderDate ? (
            <Text style={styles.lastOrder}>Last Ordered: {lastOrderDate}</Text>
          ) : null}
        </View>

        <View style={styles.priceWrap}>
          <Text style={styles.fromLabel}>From</Text>
          <Text style={styles.price}>£{price}</Text>
        </View>
      </View>

      {/* Full-width button */}
      <TouchableOpacity
        style={[styles.button, disabled && styles.buttonDisabled]}
        onPress={handlePress}
        disabled={disabled || loading}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>{buttonText}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 4,
    elevation: 2,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },

  // Image
  imageBox: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 54,
    height: 54,
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Fonts.regular,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  outOfStockBadge: {
    fontSize: 9,
    color: '#ef4444',
    fontFamily: Fonts.medium,
    backgroundColor: '#fef2f2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Title
  titleWrap: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 15,
    color: '#0f172a',
    fontFamily: Fonts.bold,
    fontWeight: '700',
    lineHeight: 20,
  },
  lastOrder: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: Fonts.regular,
    marginTop: 3,
  },

  // Price
  priceWrap: {
    alignItems: 'flex-end',
  },
  fromLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontFamily: Fonts.regular,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  price: {
    fontSize: 18,
    color: PRIMARY,
    fontFamily: Fonts.bold,
    fontWeight: '700',
    lineHeight: 22,
  },

  // Button
  button: {
    width: '100%',
    backgroundColor: PRIMARY,
    minHeight: 44,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#94a3b8',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
});
