import React, {useState} from 'react';
import {View, Text, ScrollView, StyleSheet, ActivityIndicator, Modal} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import usePatientInfoStore from '../store/patientInfoStore';
import useBmiStore from '../store/bmiStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import useGpDetailsStore from '../store/gpDetailStore';
import useCheckoutStore from '../store/checkoutStore';
import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import useAuthStore from '../store/authStore';
import usePasswordReset from '../store/usePasswordReset';
import useProductId from '../store/useProductIdStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useLastBmi from '../store/useLastBmiStore';
import useUserDataStore from '../store/userDataStore';
import useSignupStore from '../store/signupStore';
import sendStepData from '../api/stepsDataApi';
import toast from 'react-native-toast-message';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';
import {logApiError} from '../utils/logApiDebug';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const ReviewAnswers = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [showLoader, setShowLoader] = useState(false);

  const {patientInfo, setPatientInfo, clearPatientInfo} = usePatientInfoStore();
  const {clearAuthUserDetail} = useAuthUserDetailStore();
  const {bmi, setBmi, clearBmi} = useBmiStore();
  const {medicalInfo, setMedicalInfo, clearMedicalInfo} = useMedicalInfoStore();
  const {confirmationInfo, setConfirmationInfo, clearConfirmationInfo} = useConfirmationInfoStore();
  const {gpdetails, setGpDetails, clearGpDetails} = useGpDetailsStore();
  const {clearCheckout} = useCheckoutStore();
  const {clearMedicalQuestions} = useMedicalQuestionsStore();
  const {clearConfirmationQuestions} = useConfirmationQuestionsStore();
  const {clearShipping, clearBilling} = useShippingOrBillingStore();
  const {clearToken} = useAuthStore();
  const {setIsPasswordReset} = usePasswordReset();
  const {productId, clearProductId} = useProductId();
  const {setLastBmi, clearLastBmi} = useLastBmi();
  const {clearUserData} = useUserDataStore();
  const {
    firstName,
    lastName,
    clearFirstName,
    clearLastName,
    clearEmail,
    clearConfirmationEmail,
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
      logApiError(error);
      if (error?.response?.data?.message === 'Unauthenticated.') {
        toast.show({type: 'error', text1: 'Session Expired'});
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
      } else {
        const errors =
          error?.response?.data?.original?.errors ||
          error?.response?.data?.errors;
        if (errors) {
          Object.values(errors)
            .flat()
            .forEach(msg => toast.show({type: 'error', text1: msg}));
        }
      }
      setShowLoader(false);
    },
  });

  const handleSubmit = () => {
    setShowLoader(true);
    const formattedMedicalInfo = medicalInfo?.map(item => ({
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
  };

  const addressLine = [
    patientInfo?.address?.addressone,
    patientInfo?.address?.addresstwo,
    patientInfo?.address?.city,
    patientInfo?.address?.state,
    patientInfo?.address?.postalcode,
  ]
    .filter(Boolean)
    .join(', ') || 'Not provided';

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: '95%'}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>95% COMPLETED</Text>
            <Text style={styles.heading}>Review Your Answers</Text>
            <Text style={styles.description}>
              Please check that your details and medical answers are correct
              before continuing.
            </Text>
          </View>

          <View style={styles.cardBody}>
            {/* Contact details */}
            <Text style={styles.sectionTitle}>Contact details</Text>
            <View style={styles.contactBox}>
              <View style={styles.contactCol}>
                <Text style={styles.fieldLabel}>RESIDENTIAL ADDRESS</Text>
                <Text style={styles.addressText}>{addressLine}</Text>
              </View>
              <View style={[styles.contactCol, styles.contactColBorder]}>
                <Text style={styles.fieldLabel}>PHONE NUMBER</Text>
                <Text style={styles.addressText}>
                  {patientInfo?.phoneNo || 'Not provided'}
                </Text>
              </View>
            </View>

            {/* Medical questionnaire */}
            <Text style={[styles.sectionTitle, {marginTop: 22}]}>
              Medical questionnaire
            </Text>
            <View style={styles.medicalBox}>
              {medicalInfo?.map((item, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.medicalRow,
                    idx === 0 && {borderTopWidth: 0},
                  ]}>
                  <View style={styles.medicalHeader}>
                    <View style={styles.numberBadge}>
                      <Text style={styles.numberBadgeText}>{idx + 1}</Text>
                    </View>
                    <Text style={styles.questionText}>
                      {item.question.replace(/<[^>]+>/g, '')}
                    </Text>
                  </View>
                  <View style={styles.answerBlock}>
                    <View style={styles.answerRow}>
                      <Text style={styles.answerLabel}>YOUR ANSWER</Text>
                      <Text style={styles.answerValue}>
                        {item?.answer || 'Not answered'}
                      </Text>
                    </View>
                    {String(item?.subfield_response || '').trim() && (
                      <Text style={styles.subfieldText}>
                        {item.subfield_response}
                      </Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.buttonWrap}>
              <NextButton
                onPress={handleSubmit}
                label="Confirm and Proceed"
                style={styles.submitButton}
              />
              <BackButton
                onPress={() => navigation.navigate('signup')}
                label="Edit answers"
              />
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
};

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

  sectionTitle: {
    fontSize: 14.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 10,
  },

  // Contact box
  contactBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#FBFBFD',
    overflow: 'hidden',
  },
  contactCol: {
    padding: 16,
  },
  contactColBorder: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  fieldLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  addressText: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#334155',
    lineHeight: 19,
  },

  // Medical box
  medicalBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  medicalRow: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  medicalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  numberBadge: {
    width: 22,
    height: 22,
    borderRadius: 7,
    backgroundColor: 'rgba(71, 49, 124, 0.07)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBadgeText: {
    fontSize: 10.5,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },
  questionText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    lineHeight: 19,
  },
  answerBlock: {
    marginLeft: 32,
    marginTop: 10,
    borderLeftWidth: 2,
    borderLeftColor: 'rgba(71, 49, 124, 0.25)',
    paddingLeft: 12,
  },
  answerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
  },
  answerLabel: {
    fontSize: 9.5,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  answerValue: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
    textTransform: 'capitalize',
  },
  subfieldText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 18,
    marginTop: 5,
  },

  buttonWrap: {
    marginTop: 22,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 20,
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

export default ReviewAnswers;
