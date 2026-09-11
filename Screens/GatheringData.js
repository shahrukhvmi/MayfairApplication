// screens/GatherDataScreen.js
import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, ToastAndroid } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useMutation } from "@tanstack/react-query";

import getVariationsApi from "../api/getVariationsApi";
import useVariationStore from "../store/useVariationStore";
import useShipmentCountries from "../store/useShipmentCountriesStore";
import useBillingCountries from "../store/useBillingCountriesStore";
import useCartStore from "../store/useCartStore";
import useProductId from "../store/useProductIdStore";
import usePatientInfoStore from "../store/patientInfoStore";
import useAuthUserDetailStore from "../store/useAuthUserDetailStore";
import useMedicalInfoStore from "../store/medicalInfoStore";
import useConfirmationInfoStore from "../store/confirmationInfoStore";
import useGpDetailsStore from "../store/gpDetailStore";
import useCheckoutStore from "../store/checkoutStore";
import useMedicalQuestionsStore from "../store/medicalQuestionStore";
import useConfirmationQuestionsStore from "../store/confirmationQuestionStore";
import useShippingOrBillingStore from "../store/shipingOrbilling";
import useAuthStore from "../store/authStore";
import usePasswordReset from "../store/usePasswordReset";
import useLastBmi from "../store/useLastBmiStore";
import useSignupStore from "../store/signupStore";
import useBmiStore from "../store/bmiStore";
import useUserDataStore from "../store/userDataStore";
import AnimatedLogoLoader from "../Components/AnimatedLogoLoader";
import { userConsultationApi } from "../api/userConsultationApi";
import useReturning from "../store/useReturningPatient";
import useAbandonCardStore from "../store/useAbandonCardStore";

const GatherDataScreen = () => {
    const navigation = useNavigation();
    const [showLoader, setShowLoader] = useState(false);

    const { setVariation } = useVariationStore();
    const { setShipmentCountries } = useShipmentCountries();
    const { setBillingCountries } = useBillingCountries();
    const { clearCart } = useCartStore();

    const { clearPatientInfo } = usePatientInfoStore();
    const { clearAuthUserDetail } = useAuthUserDetailStore();
    const { clearBmi } = useBmiStore();
    const { clearMedicalInfo } = useMedicalInfoStore();
    const { clearConfirmationInfo } = useConfirmationInfoStore();
    const { clearGpDetails } = useGpDetailsStore();

    const { clearCheckout } = useCheckoutStore();
    const { clearMedicalQuestions } = useMedicalQuestionsStore();
    const { clearConfirmationQuestions } = useConfirmationQuestionsStore();
    const { clearShipping, clearBilling } = useShippingOrBillingStore();
    const { clearToken } = useAuthStore();
    const { setIsPasswordReset } = usePasswordReset();
    const { productId, clearProductId } = useProductId();
    const { clearLastBmi } = useLastBmi();
    const { clearUserData } = useUserDataStore();
    const { clearFirstName, clearLastName, clearEmail, clearConfirmationEmail } = useSignupStore();

    /* Abandoned-cart restore ke liye setters */
    const { setPatientInfo } = usePatientInfoStore();
    const { setAuthUserDetail } = useAuthUserDetailStore();
    const { setBmi } = useBmiStore();
    const { setMedicalInfo } = useMedicalInfoStore();
    const { setConfirmationInfo } = useConfirmationInfoStore();
    const { setGpDetails } = useGpDetailsStore();
    const { setCheckout } = useCheckoutStore();
    const { setShipping, setBilling } = useShippingOrBillingStore();
    const { setLastBmi } = useLastBmi();
    const { setFirstName, setLastName } = useSignupStore();
    const { setIsReturningPatient } = useReturning();
    const { abandonCard, setExtra, clearAbandonCard } = useAbandonCardStore();

    /*______________________ Feth Variation Api  _______________ */
    const variationMutation = useMutation(getVariationsApi, {
        onSuccess: (data) => {
            if (data) {
                clearCart();
                const variations = data?.data?.data || [];
                setVariation(variations);
                setShipmentCountries(data?.data?.data?.shippment_countries);
                setBillingCountries(data?.data?.data?.billing_countries);
                navigation.navigate("dose-selection");
            }
        },
        onError: (error) => {
            setShowLoader(false);
            if (error?.response?.data?.message === "Unauthenticated.") {
                ToastAndroid.show("Session Expired", ToastAndroid.LONG);
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
                navigation.navigate("Login"); // <- adjust to your login screen
            } else {
                // Product out of stock / koi aur error → gathering-data pe atakne ke bajaye dashboard
                ToastAndroid.show(
                    error?.response?.data?.errors?.Product || "Something went wrong",
                    ToastAndroid.LONG,
                );
                clearAbandonCard();
                navigation.reset({ index: 0, routes: [{ name: "dashboard" }] });
            }
        },
    });

    /*______________________ Abandoned Cart Restore (web jaisa) _______________ */
    const consultationMutation = useMutation(userConsultationApi, {
        onSuccess: (data) => {
            const result = data?.data?.data;
            setExtra(result?.extra); // dose-selection pe ye dose auto-add hogi

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
                setFirstName(result?.auth_user?.fname);
                setLastName(result?.auth_user?.lname);
                setIsReturningPatient(result?.isReturning);
            }
        },
        onError: (error) => {
            setShowLoader(false);
            // Product out of stock / restore fail → dashboard pe bhej do
            ToastAndroid.show(
                error?.response?.data?.errors?.Product || "Something went wrong",
                ToastAndroid.LONG,
            );
            clearAbandonCard();
            navigation.reset({ index: 0, routes: [{ name: "dashboard" }] });
        },
    });

    // Agar abandoned-cart hai to consultation API se last cart restore karo
    useEffect(() => {
        if (abandonCard?.type === "abandoned-cart") {
            consultationMutation.mutate({
                clinic_id: 1,
                product_id: abandonCard.productId,
                type: abandonCard.type,
                eid: Number(abandonCard.eid),
            });
        }
    }, [abandonCard?.type]);

    // ✅ Replace useEffect with useFocusEffect
    useFocusEffect(
        React.useCallback(() => {
            setShowLoader(true);
            if (productId != null) {
                variationMutation.mutate({ id: productId, data: {} });
            }

            // optional: cleanup when leaving screen
            return () => {
                setShowLoader(false);
            };
        }, [productId])
    );

    return (
        <View style={styles.container}>
            {showLoader && (
                <View style={styles.loaderOverlay}>
                    <AnimatedLogoLoader />
                </View>
            )}
        </View>
    );
};

export default GatherDataScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FBFBFD",
        justifyContent: "center",
        alignItems: "center",
    },
    loaderOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "#FBFBFD",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
    },
});
