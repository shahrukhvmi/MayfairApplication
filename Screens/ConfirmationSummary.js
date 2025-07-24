import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import usePatientInfoStore from '../store/patientInfoStore';
import useBmiStore from '../store/bmiStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import useProductId from '../store/useProductIdStore';
import useGpDetailsStore from '../store/gpDetailStore';
import useSignupStore from '../store/signupStore';
import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';
import useUserDataStore from '../store/userDataStore';
import useCheckoutStore from '../store/checkoutStore';
import useReorderBackProcessStore from '../store/useReorderBackProcess';
// import sendStepData from '../api/stepsDataApi';
import {useMutation} from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import sendStepData from '../api/stepsDataApi';
import useLastBmi from '../store/useLastBmiStore';

export default function ConfirmationSummary() {
  const navigation = useNavigation();
  const [showLoader, setShowLoader] = useState(false);

  // Zustand stores
  const {patientInfo, setPatientInfo, clearPatientInfo} = usePatientInfoStore();
  const {authUserDetail, clearAuthUserDetail} = useAuthUserDetailStore();
  const {bmi, setBmi, clearBmi} = useBmiStore();
  const {medicalInfo, setMedicalInfo, clearMedicalInfo} = useMedicalInfoStore();
  const {confirmationInfo, setConfirmationInfo, clearConfirmationInfo} =
    useConfirmationInfoStore();
  const {gpdetails, setGpDetails, clearGpDetails} = useGpDetailsStore();
  const {reorderBackProcess} = useReorderBackProcessStore();
  const {clearCheckout} = useCheckoutStore();
  const {clearMedicalQuestions} = useMedicalQuestionsStore();
  const {clearConfirmationQuestions} = useConfirmationQuestionsStore();
  const {clearShipping, clearBilling} = useShippingOrBillingStore();
  const {clearToken} = useAuthStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {productId, clearProductId} = useProductId();
  const {clearUserData} = useUserDataStore();
  const {setLastBmi, clearLastBmi} = useLastBmi();

  const {
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
    firstName,
    lastName,
  } = useSignupStore();

  const stepsDataMutation = useMutation(sendStepData, {
    onSuccess: data => {
      if (data?.data?.lastConsultation) {
        const fields = data?.data?.lastConsultation?.fields;
        setBmi(fields?.bmi);
        setConfirmationInfo(fields?.confirmationInfo);
        setGpDetails(fields?.gpdetails);
        setMedicalInfo(fields?.medicalInfo);
        setPatientInfo(fields?.patientInfo);
        setLastBmi(fields?.bmi);
      }
      navigation.navigate('gathering-data');
    },
    onError: error => {
      setShowLoader(false);
      const message = error?.response?.data?.message;
      if (message === 'Unauthenticated.') {
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
        navigation.navigate('login');
      } else if (error?.response?.data?.original?.errors) {
        const errors = error?.response?.data?.original?.errors;
        Object.keys(errors).forEach(key => {
          const msg = errors[key];
          Array.isArray(msg)
            ? msg.forEach(m => Toast.show({type: 'error', text1: m}))
            : Toast.show({type: 'error', text1: msg});
        });
      }
    },
  });


  const hanldeConfirm = () => {
    setShowLoader(true);

    const formattedMedicalInfo = medicalInfo.map(item => ({
      question: item.question,
      qsummary: item.qsummary,
      answer: item.answer,
      subfield_response: item.subfield_response,
      sub_field_prompt: item.sub_field_prompt,
      has_sub_field: item.has_sub_field,
    }));

    const fname = firstName || patientInfo?.firstName;
    const lname = lastName || patientInfo?.lastName;

    const formData = {
      patientInfo: {
        firstName: fname,
        lastName: lname,
        dob: patientInfo?.dob,
        ethnicity: patientInfo?.ethnicity,
        gender: patientInfo?.gender,
        phoneNo: patientInfo?.phoneNo,
        pregnancy: patientInfo?.pregnancy,
        address: patientInfo?.address,
      },
      bmi: bmi,
      gpdetails: gpdetails,
      confirmationInfo: confirmationInfo,
      medicalInfo: formattedMedicalInfo,
      pid: productId,
    };

    stepsDataMutation.mutate(formData);
    // console.log(
    //   '=============================================================================',
    // );
    // console.log('Form Data:', JSON.stringify(formData, null, 2));
  };

  const reviewAll = () => {
    navigation.navigate('review-answer');
  };

  const back = () => {
    navigation.navigate(reorderBackProcess ? 'bmi' : 'gp-detail');
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>95% Completed</Text>

        {/* Title */}
        <Text style={styles.heading}>Confirm your answers</Text>
        <Text style={styles.subheading}>
          It’s important your answers are accurate, as we’ll use them to
          determine your suitability for the treatment.
        </Text>

        {/* Summary Box */}
        <View style={styles.answerBox}>
          <Text style={styles.row}>
            <Text style={styles.label}>Full Name: </Text>
            <Text style={styles.value}>
              {firstName
                ? `${firstName} ${lastName}`
                : `${patientInfo?.firstName} ${patientInfo?.lastName}`}
            </Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Post code: </Text>
            <Text style={styles.value}>{patientInfo?.address?.postalcode}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Date of Birth: </Text>
            <Text style={styles.value}>{patientInfo?.dob}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Gender: </Text>
            <Text style={styles.value}>{patientInfo?.gender}</Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>Height: </Text>
            <Text style={styles.value}>
              {bmi?.height_unit === 'imperial'
                ? `${bmi?.ft} ft ${bmi?.inch} inch`
                : `${bmi?.cm} cm`}
            </Text>
          </Text>

          <Text style={styles.row}>
            <Text style={styles.label}>Weight: </Text>
            <Text style={styles.value}>
              {bmi?.weight_unit === 'metrics'
                ? `${bmi?.kg} kg`
                : `${bmi?.stones} stones ${bmi?.pound} pound`}
            </Text>
          </Text>
          <Text style={styles.row}>
            <Text style={styles.label}>BMI: </Text>
            <Text style={styles.value}>{bmi?.bmi?.toFixed(1)}</Text>
          </Text>
        </View>

        {/* Buttons */}
        <NextButton label="Confirm and proceed" onPress={hanldeConfirm} />
        <BackButton label="Review all answers" onPress={reviewAll} />
        <BackButton label="Back" onPress={back} />

        {showLoader && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f5ff',
    flexGrow: 1,
    padding: 20,
    paddingBottom: 100,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    width: '95%',
    height: 4,
    backgroundColor: '#4B0082',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subheading: {
    fontSize: 14,
    color: '#333',
    marginBottom: 20,
  },
  answerBox: {
    backgroundColor: '#eee9ff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 30,
  },
  row: {
    marginBottom: 10,
    fontSize: 14,
    flexWrap: 'wrap',
  },
  label: {
    fontWeight: 'bold',
  },
  value: {
    color: '#333',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
