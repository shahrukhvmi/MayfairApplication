import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Modal,
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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

export default function ConfirmationSummary() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
      setShowLoader(false);
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

  const {email} = useSignupStore();

  const InfoTile = ({label, value}) => (
    <View style={styles.tile}>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
  );

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 24}]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: '95%'}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>95% COMPLETED</Text>
            <Text style={styles.heading}>Confirm your answers</Text>
            <Text style={styles.description}>
              It's important your answers are accurate, as we'll use them to
              determine your suitability for the treatment.
            </Text>
          </View>

          <View style={styles.cardBody}>
            {/* Summary grid */}
            <View style={styles.grid}>
              <InfoTile
                label="Name"
                value={
                  firstName
                    ? `${firstName} ${lastName}`
                    : `${patientInfo?.firstName} ${patientInfo?.lastName}`
                }
              />
              <InfoTile label="Email" value={email} />
              <InfoTile
                label="Post code"
                value={patientInfo?.address?.postalcode}
              />
              <InfoTile label="Date of Birth" value={patientInfo?.dob} />
              <InfoTile
                label="Height"
                value={
                  bmi?.height_unit === 'imperial'
                    ? `${bmi?.ft} ft ${bmi?.inch} inch`
                    : `${bmi?.cm} cm`
                }
              />
              <InfoTile label="Gender" value={patientInfo?.gender} />
              <InfoTile
                label="Weight"
                value={
                  bmi?.weight_unit === 'metrics'
                    ? `${bmi?.kg} kg`
                    : `${bmi?.stones} stones ${bmi?.pound} pound`
                }
              />
              <View style={styles.tile}>
                <Text style={styles.tileLabel}>BMI</Text>
                <Text style={styles.tileValueBmi}>{bmi?.bmi?.toFixed(1)}</Text>
              </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonWrap}>
              <NextButton
                label="Confirm and proceed"
                onPress={hanldeConfirm}
                style={styles.submitButton}
              />
              <BackButton label="Review all answers" onPress={reviewAll} />
              <BackButton label="Back" onPress={back} />
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal visible={showLoader} transparent animationType="none">
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color={PRIMARY} />
        </View>
      </Modal>
    </>
  );
}

const PRIMARY = '#47317c';

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },

  // Progress bar
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: 'rgba(71, 49, 124, 0.15)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#f5f2fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.08)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  progressLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: 'rgba(71, 49, 124, 0.7)',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  heading: {
    fontSize: 21,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 18,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Summary grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 22,
  },
  tile: {
    width: '48%',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  tileLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  tileValue: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#1e293b',
  },
  tileValueBmi: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },

  buttonWrap: {
    gap: 4,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },

  loaderOverlay: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
