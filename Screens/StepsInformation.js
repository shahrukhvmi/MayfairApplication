import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';

// 🧱 Components

// 🛒 Zustand stores
import useBmiStore from '../store/bmiStore';
import useCheckoutStore from '../store/checkoutStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import useGpDetailsStore from '../store/gpDetailStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import usePatientInfoStore from '../store/patientInfoStore';
import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import useProductId from '../store/useProductIdStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';
import useUserDataStore from '../store/useUserDataStore';
import useSignupStore from '../store/signupStore';

// 📦 API
import {getMedicalQuestions} from '../api/getQuestions';
import useLastBmi from '../store/useLastBmiStore';
import Header from '../Layout/header';
import PageLoader from '../Components/PageLoader';
import {userConsultationApi} from '../api/userConsultationApi';

const StepsInformation = () => {
  const [showLoader, setShowLoader] = useState(false);
  const navigation = useNavigation();

  const {setBmi, clearBmi} = useBmiStore();
  const {setCheckout, clearCheckout} = useCheckoutStore();
  const {setConfirmationInfo, clearConfirmationInfo} =
    useConfirmationInfoStore();
  const {setGpDetails, clearGpDetails} = useGpDetailsStore();
  const {setMedicalInfo, clearMedicalInfo} = useMedicalInfoStore();
  const {setPatientInfo, clearPatientInfo} = usePatientInfoStore();
  const {setMedicalQuestions, clearMedicalQuestions} =
    useMedicalQuestionsStore();
  const {setConfirmationQuestions, clearConfirmationQuestions} =
    useConfirmationQuestionsStore();
  const {setAuthUserDetail, clearAuthUserDetail} = useAuthUserDetailStore();
  const {
    billing,
    setBilling,
    shipping,
    setShipping,
    clearBilling,
    clearShipping,
  } = useShippingOrBillingStore();
  const {clearToken} = useAuthStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {productId, clearProductId} = useProductId();
  const {setLastBmi, clearLastBmi} = useLastBmi();
  const {clearUserData} = useUserDataStore();
  const {clearFirstName, clearLastName, clearEmail, clearConfirmationEmail} =
    useSignupStore();

  const consultationMutation = useMutation(userConsultationApi, {
    onSuccess: data => {
      const result = data?.data?.data;

      console.log(result, 'Consultation Data');

      if (result == null) {
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
        setBmi(result?.bmi);
        setCheckout(result?.checkout);
        setConfirmationInfo(result?.confirmationInfo);
        setGpDetails(result?.gpdetails);
        setMedicalInfo(result?.medicalInfo);
        setPatientInfo(result?.patientInfo);
        setShipping(result?.shipping);
        setBilling(result?.billing);
        setAuthUserDetail(result?.auth_user);
        setLastBmi(result?.bmi);
        navigation.navigate('personal-details');
      }
    },
    onError: error => {
      const msg = error?.response?.data?.message;
      if (msg === 'Unauthenticated.') {
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
        clearConfirmationQuestions();
        clearToken();
        setIsPasswordReset(true);
        clearProductId();
        clearLastBmi();
        clearUserData();
        clearFirstName();
        clearLastName();
        clearEmail();
        clearConfirmationEmail();
        navigation.navigate('Login');
      }
    },
  });

  const medicalQuestionsMutation = useMutation(getMedicalQuestions, {
    onSuccess: data => {
      setMedicalQuestions(data?.data?.data?.medical_question);
      setConfirmationQuestions(data?.data?.data?.confirmation_question);
    },
    onError: () => {
      setShowLoader(false);
    },
  });

  useEffect(() => {
    const formData = {
      clinic_id: 1,
      product_id: productId,
    };
    setShowLoader(true);

    if (productId != null) {
      consultationMutation.mutate(formData);
      medicalQuestionsMutation.mutate();
    }

    setShowLoader(false);
  }, [productId]);

  return (
    <View style={styles.container}>
      <Header />
      {showLoader && (
        <View style={styles.loaderOverlay}>
          <PageLoader />
        </View>
      )}
    </View>
  );
};

export default StepsInformation;

const {width, height} = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
});
