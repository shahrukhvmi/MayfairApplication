import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
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
import { logApiError } from '../utils/logApiDebug';

const ReviewAnswers = () => {
    const navigation = useNavigation();
    const [showLoader, setShowLoader] = useState(false);

    const { patientInfo, setPatientInfo, clearPatientInfo } = usePatientInfoStore();
    const { authUserDetail, clearAuthUserDetail } = useAuthUserDetailStore();
    const { bmi, setBmi, clearBmi } = useBmiStore();
    const { medicalInfo, setMedicalInfo, clearMedicalInfo } = useMedicalInfoStore();
    const { confirmationInfo, setConfirmationInfo, clearConfirmationInfo } = useConfirmationInfoStore();
    const { gpdetails, setGpDetails, clearGpDetails } = useGpDetailsStore();
    const { clearCheckout } = useCheckoutStore();
    const { clearMedicalQuestions } = useMedicalQuestionsStore();
    const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
    const { clearShipping, clearBilling } = useShippingOrBillingStore();
    const { clearToken } = useAuthStore();
    const { setIsPasswordReset } = usePasswordReset();
    const { productId, clearProductId } = useProductId();
    const { setLastBmi, clearLastBmi } = useLastBmi();
    const { clearUserData } = useUserDataStore();
    const { firstName,
        lastName, clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } = useSignupStore();


    console.log(JSON.stringify(patientInfo?.firstName, 2, null), "patientInfo")
    const stepsDataMutation = useMutation(sendStepData, {
        onSuccess: (data) => {

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
        onError: (error) => {
            logApiError(error)
            if (error?.response?.data?.message === 'Unauthenticated.') {
                toast.show({ type: 'error', text1: 'Session Expired' });
                clearBmi(); clearCheckout(); clearConfirmationInfo(); clearGpDetails();
                clearMedicalInfo(); clearPatientInfo(); clearBilling(); clearShipping();
                clearAuthUserDetail(); clearMedicalQuestions(); clearConfirmationQuestions();
                clearToken(); setIsPasswordReset(true); clearProductId(); clearLastBmi();
                clearUserData(); clearFirstName(); clearLastName(); clearEmail(); clearConfirmationEmail();
                navigation.navigate('Login');
            } else {
                const errors = error?.response?.data?.original?.errors || error?.response?.data?.errors;
                if (errors) {
                    Object.values(errors).flat().forEach(msg => toast.show({ type: 'error', text1: msg }));
                }
            }
            setShowLoader(false);
        }
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

    return (
        <>

            <Header />
            <View style={styles.container}>
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <Text style={styles.title}>Review Your Answers</Text>
                    <View style={styles.innerSection}>


                        <View style={styles.section}>
                            <Text style={styles.label}>Patient Residential Address</Text>
                            <Text style={styles.value}>{patientInfo?.address?.postalcode}</Text>
                            <Text style={styles.value}>{patientInfo?.address?.addressone}</Text>
                            {patientInfo?.address?.addresstwo?.trim() && <Text style={styles.value}>{patientInfo.address.addresstwo}</Text>}
                            <Text style={styles.value}>{patientInfo?.address?.city}</Text>
                            <Text style={styles.value}>{patientInfo?.address?.state}</Text>
                        </View>

                        <View style={styles.section}>
                            <Text style={styles.label}>Phone Number</Text>
                            <Text style={styles.value}>{patientInfo?.phoneNo}</Text>
                        </View>

                        {medicalInfo?.map((item, idx) => (
                            <View key={idx} style={styles.section}>
                                <Text style={styles.label}>{item.question.replace(/<[^>]+>/g, '')}</Text>
                                <Text style={styles.value}>{item.answer}</Text>
                                {item?.subfield_response && <Text style={styles.value}>{item.subfield_response}</Text>}
                            </View>
                        ))}

                    </View>
                    <View style={{ marginTop: 16 }}>

                        <NextButton onPress={handleSubmit} label='Confirm and Proceed' />
                        <BackButton
                            onPress={() => navigation.navigate('signup')}
                            label="Edit Answers"
                        />
                    </View>
                </ScrollView>

                {showLoader && (
                    <View style={styles.loaderOverlay}>
                        <ActivityIndicator size="large" color="#4B0082" />
                    </View>
                )}
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    innerSection: { backgroundColor: '#f8f5ff', borderRadius: 12, padding: 12 },
    scrollContainer: { padding: 20, },
    title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
    section: { marginBottom: 16 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#000' },
    value: { fontSize: 14, color: '#555', marginTop: 4 },
    button: { backgroundColor: '#000', padding: 12, borderRadius: 6, alignItems: 'center', marginTop: 10 },
    secondaryButton: { backgroundColor: '#555' },
    buttonText: { color: '#fff', fontSize: 16 },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.6)',
    },
});

export default ReviewAnswers;
