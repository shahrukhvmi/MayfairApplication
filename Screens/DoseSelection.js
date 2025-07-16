import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView,
  Image, StyleSheet, ActivityIndicator
} from 'react-native';
import Modal from 'react-native-modal';
import { useForm } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { useMutation } from '@tanstack/react-query';
import useCartStore from '../store/useCartStore';
import useVariationStore from '../store/useVariationStore';
import useReorder from '../store/useReorderStore';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';
import Dose from '../Components/Dose';
import Addon from '../Components/addon';
import NextButton from '../Components/NextButton';
import { abandonCart } from '../api/abandonCartApi';
import useProductId from '../store/useProductIdStore';
import useShipmentCountries from '../store/useShipmentCountriesStore';
import useBillingCountries from '../store/useBillingCountriesStore';
import usePatientInfoStore from '../store/patientInfoStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
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
import useLastBmi from '../store/useLastBmiStore';
import useUserDataStore from '../store/useUserDataStore';
import useSignupStore from '../store/signupStore';
import getVariationsApi from '../api/getVariationsApi';
import { logApiSuccess } from '../utils/logApiDebug';

export default function DoseSelection({ navigation }) {
  const { handleSubmit } = useForm();


  /* _________________Zustand state here ______________*/

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
  const { variation, setVariation } = useVariationStore();
  const { addToCart, increaseQuantity, decreaseQuantity, items, totalAmount } = useCartStore();
  const { reorder } = useReorder();


  /* _________________Local State here ______________*/
  const [shownDoseIds, setShownDoseIds] = useState([]);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [showLoader, setShowLoader] = useState(false);




  // ✅ Always define this near the top of your component
  const totalSelectedQty = () => items?.doses?.reduce((t, d) => t + d.qty, 0);

  const currentQty = totalSelectedQty();


  /*________ Abandon Cart API hit here ________*/
  const abandonMutation = useMutation(abandonCart, {
    onSuccess: () => navigation.navigate('checkout'),
    onError: () => navigation.navigate('checkout'),
  });
  /*________ Abandon Cart API hit here ________*/
  const onSubmit = () => {
    const payload = items.doses.map(d => ({ eid: d.id, pid: productId }));
    abandonMutation.mutate(payload);
  };

  const generateProductConcent = (vars, selectedName) => {
    if (!Array.isArray(vars) || vars.length === 0) {
      return 'Product details are unavailable at the moment.';
    }

    const sorted = [...vars].sort((a, b) => parseFloat(a.name) - parseFloat(b.name));
    const selIndex = sorted.findIndex(v => v?.name === selectedName);
    const lowestDose = sorted[0]?.name;
    const prev = selIndex > 0 ? sorted[selIndex - 1].name : sorted[0].name;
    // return `If you are taking for the first time, start on ${prev} or ${selectedName} to reduce side effects.`;

    return `If you are taking for the first time, you will need to start the treatment on the ${lowestDose} dose. If you start on the higher doses, the risk of side effects (e.g., nausea) will be very high. Please confirm that you are currently taking either the ${prev} or ${selectedName} dose from a different provider.`;
  };


  const handleAddDose = dose => {
    const allowed = variation.allowed;



    const totalQty = currentQty + 1;

    if (allowed && totalQty > allowed) {
      return Toast.show({ type: 'error', text1: `Only ${allowed} units allowed.` });
    }

    const existing = items.doses.find(d => d.id === dose.id)?.qty || 0;
    if (existing + 1 > dose.stock.quantity) {
      return Toast.show({ type: 'error', text1: `Only ${dose.stock.quantity} available.` });
    }

    const isFirstDose = parseFloat(dose.name) <= parseFloat(variation.variations[0].name);
    let product_concent = null;

    if (!(isFirstDose || reorder)) {
      product_concent = generateProductConcent(variation.variations, dose.name);
      if (!shownDoseIds.includes(dose.id)) {
        setSelectedDose({ ...dose, product_concent });
        setShowDoseModal(true);
        setShownDoseIds(prev => [...prev, dose.id]);
      }
    }
    /*______________________ AddtoCart here Doses  _______________ */

    addToCart({
      id: dose.id, type: 'dose', name: dose.name,
      price: parseFloat(dose.price), allowed: parseInt(dose.allowed),
      item_id: dose.id, product: variation.name,
      product_concent, label: `${variation.name} ${dose.name}`, expiry: dose.expiry,
      isSelected: true
    });
  };
  /*______________________ AddtoCart here Addons  _______________ */

  const handleAddAddon = addon => {
    addToCart({
      id: addon.id, type: 'addon', name: addon.name,
      price: parseFloat(addon.price), allowed: parseInt(addon.allowed),
      item_id: addon.id, product: addon.title, product_concent: null,
      label: addon.name, expiry: addon.expiry, isSelected: true
    });
  };

  /*______________________ Feth Variation Api  _______________ */

  const variationMutation = useMutation(getVariationsApi, {
    onSuccess: (data) => {
      console.log(data, "getVariationsApi");
      if (data) {
        clearCart();
        // toast.success("User registered successfully!");
        const product = data?.data?.data;
        setVariation(product); // ✅ object with .variations, .addons, etc.

        logApiSuccess(product)
        setShipmentCountries(data?.data?.data?.shippment_countries);
        setBillingCountries(data?.data?.data?.billing_countries);
        // Redirect
      }
    },
    onError: (error) => {
      if (error) {
        if (error?.response?.data?.message == "Unauthenticated.") {
          Toast.show({
            type: 'error',
            text1: 'Session',
            text2: 'Expired'
          })
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
          navigation.navigate("Login");
        } else {
          setShowLoader(false);
          Toast.show({
            type: 'error',
            text1: error?.response?.data?.errors?.Product
          })
        }
      }
    },
  });

  useEffect(() => {
    setShowLoader(true);
    if (productId != null) {
      // console.log("Api Run");
      variationMutation.mutate({ id: productId, data: {} });
    }
  }, [productId]);

  /*______________________  loader   _______________ */

  if (!variation?.variations) {
    return <ActivityIndicator size="large" color="#4B0082" style={{ flex: 1, justifyContent: 'center', }} />;
  }

  return (
    <View style={styles.screen}>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={{ uri: variation.img }} style={styles.image} />
        <Text style={styles.title}>{variation.name}</Text>
        <Text style={styles.price}>From £{variation.price}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose your Dosage</Text>
          {variation?.variations
            ?.sort((a, b) => {
              const aOutOfStock = a?.stock?.status === 0;
              const bOutOfStock = b?.stock?.status === 0;
              const qOutOfStock = b?.stock?.quantity === 0;
              const qaOutOfStock = a?.stock?.quantity === 0;

              // Out of stock ko neeche le jao
              if (qaOutOfStock && !qOutOfStock) return 1;
              if (!qaOutOfStock && qOutOfStock) return -1;
              if (aOutOfStock && !bOutOfStock) return 1;
              if (!aOutOfStock && bOutOfStock) return -1;
              return 0;
            })
            .map((dose, index) => {
              const cartDose = items.doses.find(
                (item) => item.id === dose.id
              );
              const cartQty = cartDose?.qty || 0;
              return (
                <Dose
                  key={dose.id}
                  doseData={dose}
                  qty={cartQty}
                  isSelected={cartQty > 0}
                  onAdd={() => handleAddDose(dose)}
                  onIncrement={() => increaseQuantity(dose.id, 'dose')}
                  onDecrement={() => decreaseQuantity(dose.id, 'dose')}
                  totalSelectedQty={currentQty}
                  allow={variation.allowed}
                />
              );
            })}
        </View>

        {variation.addons?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Add‑ons</Text>
            {variation?.addons
              .slice()
              .sort((a, b) => {
                const aOutOfStock =
                  a?.stock?.status === 0 ||
                    a?.stock?.quantity === 0
                    ? 1
                    : 0;
                const bOutOfStock =
                  b?.stock?.status === 0 ||
                    b?.stock?.quantity === 0
                    ? 1
                    : 0;

                return aOutOfStock - bOutOfStock;
              })
              .map((addon) => {
                const cartAddon = items.addons.find(
                  (item) => item.id === addon.id
                );
                const cartQty = cartAddon?.qty || 0;
                return (
                  <Addon
                    key={addon.id}
                    addon={addon}
                    quantity={cartQty}
                    isSelected={cartQty > 0}
                    onAdd={() => handleAddAddon(addon)}
                    onIncrement={() => increaseQuantity(addon.id, 'addon')}
                    onDecrement={() => decreaseQuantity(addon.id, 'addon')}
                  />
                );
              })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Image source={{ uri: variation.img }} style={styles.footerImg} />
          <View style={styles.footerTextWrapper}>
            <Text style={styles.footerName}>{variation.name}</Text>
            <Text style={styles.footerTotal}>
              Order total £{parseFloat(totalAmount).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={styles.footerRight}>
          <BackButton label="Back" onPress={() => navigation.goBack()} />
          <NextButton
            style={styles.nextBtn}
            label={abandonMutation.isLoading ? 'Processing...' : 'Proceed to Checkout'}
            onPress={handleSubmit(onSubmit)}
            disabled={totalSelectedQty() === 0 || abandonMutation.isLoading}
          />
        </View>
      </View>


      <Modal
        isVisible={showDoseModal}
        onBackdropPress={() => setShowDoseModal(false)}
        style={styles.modal}
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Dosage Confirmation</Text>
          <Text style={styles.modalText}>{selectedDose?.product_concent}</Text>
          <NextButton label="I Confirm" onPress={() => setShowDoseModal(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2EEFF' },
  container: { padding: 18 },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain'
  },
  title: { fontSize: 22, fontWeight: 'bold', marginVertical: 10 },
  price: { fontSize: 18, marginBottom: 16 },
  section: { backgroundColor: '#fff', marginVertical: 12, padding: 16, borderRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '600', marginBottom: 12 },




  modal: { justifyContent: 'center', margin: 0 },
  modalContent: { backgroundColor: '#fff', padding: 20, marginHorizontal: 20, borderRadius: 8 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },


  footer: {
    padding: 8,
    borderTopWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },

  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },

  footerImg: {
    width: 50,
    height: 50,
    marginRight: 12,
    borderRadius: 8,
    resizeMode: 'contain',
  },

  footerTextWrapper: {
    flex: 1,
  },

  footerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },

  footerTotal: {
    fontSize: 15,
    color: '#6b7280',
    marginTop: 2,
  },

  footerRight: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
    padding: 4,
  },
  nextBtn: {
    flexGrow: 1, // 💥 let the button expand as needed
    maxWidth: 200, // optional minimum width
  },

});
