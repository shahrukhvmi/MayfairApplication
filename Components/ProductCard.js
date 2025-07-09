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

// ✅ your stores (paths may differ)
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
import useReturning from '../store/useReorderStore';

// ✅ API
import userConsultationApi from '../api/userConsultationApi';

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
  /* ───────── hooks / stores ───────── */
  const navigation = useNavigation();
  const {setProductId} = useProductId();
  const {setReorder} = useReorder();
  const {clearCoupon} = useCouponStore();

  // many setters cleared/filled by API response
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

  /* ───────── local state ───────── */
  const [loading, setLoading] = useState(false);

  /* ───────── mutation ───────── */
  const consultationMutation = useMutation({
    mutationFn: userConsultationApi,
    onSuccess: res => {
      const data = res?.data?.data;

      // if no existing consultation wipe all old state
      if (!data) {
        clearBmi();
        clearCheckout();
        clearConfirmationInfo();
        clearGpDetails();
        clearMedicalInfo();
        clearPatientInfo();
        clearBilling();
        clearShipping();
        clearAuthUserDetail();
      } else {
        // hydrate stores
        setBmi(data.bmi);
        setCheckout(data.checkout);
        setConfirmationInfo(data.confirmationInfo);
        setGpDetails(data.gpdetails);
        setMedicalInfo(data.medicalInfo);
        setPatientInfo(data.patientInfo);
        setShipping(data.shipping);
        setBilling(data.billing);
        setAuthUserDetail(data.auth_user);
        setLastBmi(data.bmi);
        setFirstName(data.patientInfo?.firstName);
        setLastName(data.patientInfo?.lastName);
        setIsReturningPatient(data.isReturning);
      }

      // route

      setLoading(false);
    },
    onError: err => {
      Toast.show({
        type: 'error',
        text1: err?.response?.data?.errors || 'Something went wrong',
      });
      setLoading(false);
    },
  });

  /* ───────── handlers ───────── */
  const handlePress = () => {
    if (loading) return;
    setProductId(id);
    setLoading(true);
    consultationMutation.mutate({clinic_id: 1, product_id: id});
    if (reorder) {
      navigation.navigate('Acknowledgment');
      setReorder(true);
      clearCoupon();
    } else {
      setReorder(false);
      navigation.navigate('Acknowledgment');
    }
  };

  /* ───────── UI ───────── */
  const disabled = status === false;

  return (
    <View style={styles.card}>
      {/* overlay if out-of-stock */}
      {!status && <View style={styles.overlay} />}

      {/* Out of stock ribbon */}
      {!status && (
        <View style={[styles.ribbon, styles.ribbonLeft]}>
          <Text style={styles.ribbonText}>Out of stock</Text>
        </View>
      )}

      {/* Price ribbon */}
      {price && (
        <View style={[styles.ribbon, styles.ribbonRight]}>
          <Text style={styles.ribbonText}>{`From £${price}`}</Text>
        </View>
      )}

      {/* product image */}
      <View style={styles.imageWrap}>
        <Image
          source={{uri: image}}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* details */}
      <View style={styles.detailBox}>
        <Text style={styles.title}>{title}</Text>
        {lastOrderDate ? (
          <Text
            style={styles.lastOrder}>{`Last Ordered: ${lastOrderDate}`}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, disabled && styles.buttonDisabled]}
          onPress={handlePress}
          disabled={disabled || loading}>
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{buttonText}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ProductCard;

/* ───────── styles ───────── */
const PURPLE = '#4B0082';

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    width: '100%', // two-column grid support
    elevation: 3,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(119,136,153,0.4)',
    zIndex: 10,
  },
  ribbon: {
    position: 'absolute',
    top: 12,
    paddingVertical: 4,
    paddingHorizontal: 32,
    backgroundColor: '#ff5555',
    transform: [{rotate: '-45deg'}],
    zIndex: 20,
  },
  ribbonLeft: {
    left: -40,
  },
  ribbonRight: {
    right: -40,
    backgroundColor: '#4285f4',
    transform: [{rotate: '45deg'}],
  },
  ribbonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  imageWrap: {
    height: 160,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '80%',
    height: '80%',
  },
  detailBox: {
    backgroundColor: '#EDE9FE',
    padding: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  lastOrder: {
    fontSize: 12,
    color: '#555',
    marginBottom: 12,
  },
  button: {
    backgroundColor: PURPLE,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 24,
  },
  buttonDisabled: {
    backgroundColor: '#8d83b4',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
});
