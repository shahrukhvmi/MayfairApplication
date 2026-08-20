import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import Modal from 'react-native-modal';
import {Controller, useForm} from 'react-hook-form';
import Toast from 'react-native-toast-message';
import useCartStore from '../store/useCartStore';
import useVariationStore from '../store/useVariationStore';
import useAbandonCardStore from '../store/useAbandonCardStore';
import useReorder from '../store/useReorderStore';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';
import Dose from '../Components/Dose';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Addon from '../Components/addon';
import NextButton from '../Components/NextButton';
import useProductId from '../store/useProductIdStore';
import {abandonCart} from '../api/abandonCartApi';
import CustomCheckbox from '../Components/CustomCheckbox';
import {useFocusEffect} from '@react-navigation/native';

export default function DoseSelection({navigation}) {
  const {
    control,
    handleSubmit,
    clearErrors,
    setValue,
    formState: {isValid, errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      terms: false,
    },
  });

  /* _________________Zustand state here ______________*/
  const {variation} = useVariationStore();
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadTimeout(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const [isExpiryRequired, setIsExpiryRequired] = useState(false);

  // Variation From zustand
  useFocusEffect(
    React.useCallback(() => {
      if (variation?.show_expiry === 1) {
        setIsExpiryRequired(true);
        setTimeout(() => {
          // Force validation to kick in
          setValue('terms', false, {shouldValidate: true});
        }, 0);
      } else {
        setIsExpiryRequired(false);
        clearErrors('terms');
        setValue('terms', false);
      }
    }, [variation?.show_expiry, clearErrors, setValue]),
  );
  const {addToCart, increaseQuantity, decreaseQuantity, items, totalAmount} =
    useCartStore();
  const {reorder} = useReorder();
  const {productId} = useProductId();
  const insets = useSafeAreaInsets();
  // Wegovy Pill (tablets): local backend id 11, production id 7 — dono handle
  const isWegovyPill = Number(productId) === 7 || Number(productId) === 11;
  const {abandonCard, extra, clearAbandonCard} = useAbandonCardStore();
  const abandonAddedRef = useRef(false);

  /* _________________Local State here ______________*/
  const [shownDoseIds, setShownDoseIds] = useState([]);
  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);

  // ✅ Always define this near the top of your component
  const totalSelectedQty = () => items?.doses?.reduce((t, d) => t + d.qty, 0);

  const currentQty = totalSelectedQty();

  const onSubmit = async () => {
    try {
      await Promise.all(
        items.doses.map(d => abandonCart({eid: d.id, pid: productId})),
      );
    } catch (_) {}
    navigation.navigate('checkout');
  };

  const generateProductConcent = (vars, selectedName) => {
    // Wegovy Pill (tablets) — special confirmation text
    if (isWegovyPill) {
      return `If this is your first time taking Wegovy Tablets, you should start with the 1.5mg dose. Starting on a higher dose may increase the risk of side effects.\n\nPlease confirm that you are currently taking Wegovy Tablets from another provider, or have previously used, or currently use, a GLP-1 treatment such as Wegovy or Mounjaro.`;
    }

    if (!Array.isArray(vars) || vars.length === 0) {
      return 'Product details are unavailable at the moment.';
    }

    const sorted = [...vars].sort(
      (a, b) => parseFloat(a.name) - parseFloat(b.name),
    );
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
      return Toast.show({
        type: 'error',
        text1: `Only ${allowed} units allowed.`,
      });
    }

    const existing = items.doses.find(d => d.id === dose.id)?.qty || 0;
    if (existing + 1 > dose.stock.quantity) {
      return Toast.show({
        type: 'error',
        text1: `Only ${dose.stock.quantity} available.`,
      });
    }

    const isFirstDose =
      parseFloat(dose.name) <= parseFloat(variation.variations[0].name);
    let product_concent = null;

    if (!(isFirstDose || reorder)) {
      product_concent = generateProductConcent(variation.variations, dose.name);
      if (!shownDoseIds.includes(dose.id)) {
        setSelectedDose({...dose, product_concent});
        setShowDoseModal(true);
        setShownDoseIds(prev => [...prev, dose.id]);
      }
    }
    /*______________________ AddtoCart here Doses  _______________ */

    addToCart({
      id: dose.id,
      type: 'dose',
      name: dose.name,
      price: parseFloat(dose.price),
      allowed: parseInt(dose.allowed),
      item_id: dose.id,
      product: variation.name,
      product_concent,
      label: `${variation.name} ${dose.name}`,
      expiry: dose.expiry,
      isSelected: true,
    });
  };
  // Abandoned-cart restore: gathering-data se aayi hui `extra` dose auto-add karo
  useEffect(() => {
    if (abandonAddedRef.current) return;
    if (abandonCard?.type !== 'abandoned-cart') return;
    if (!extra || !variation?.variations) return;
    abandonAddedRef.current = true;
    handleAddDose(extra);
    clearAbandonCard();
  }, [abandonCard?.type, extra, variation?.variations]);

  /*______________________ AddtoCart here Addons  _______________ */

  const handleAddAddon = addon => {
    addToCart({
      id: addon.id,
      type: 'addon',
      name: addon.name,
      price: parseFloat(addon.price),
      allowed: parseInt(addon.allowed),
      item_id: addon.id,
      product: addon.title,
      product_concent: null,
      label: addon.name,
      expiry: addon.expiry,
      isSelected: true,
    });
  };

  /*______________________  loader   _______________ */

  if (!variation?.variations) {
    if (loadTimeout) {
      return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2EEFF', padding: 24}}>
          <Text style={{fontSize: 16, color: '#333', textAlign: 'center', marginBottom: 20}}>
            Something went wrong loading dose options.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('gathering-data')}
            style={{backgroundColor: '#4B0082', borderRadius: 30, paddingVertical: 12, paddingHorizontal: 32}}>
            <Text style={{color: '#fff', fontWeight: 'bold', fontSize: 15}}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2EEFF'}}>
        <ActivityIndicator size="large" color="#4B0082" />
      </View>
    );
  }

  return (
    <>
      <View style={styles.screen}>
        <Header />
        <ScrollView contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 30}]}>
          <View style={styles.header}>
            <Image source={{uri: variation.img}} style={styles.image} />
          </View>
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
                const cartDose = items.doses.find(item => item.id === dose.id);
                const cartQty = cartDose?.qty || 0;
                // Wegovy injection (productId 1) ke 7.2mg dose pe pack info banner
                const is72mgSelected =
                  dose?.name === '7.2mg' &&
                  Number(productId) === 1 &&
                  cartQty > 0;
                return (
                  <React.Fragment key={dose.id}>
                    <Dose
                      doseData={dose}
                      qty={cartQty}
                      isSelected={cartQty > 0}
                      onAdd={() => handleAddDose(dose)}
                      onIncrement={() => increaseQuantity(dose.id, 'dose')}
                      onDecrement={() => decreaseQuantity(dose.id, 'dose')}
                      totalSelectedQty={currentQty}
                      allow={variation.allowed}
                    />
                    {is72mgSelected && (
                      <View style={styles.pack72Banner}>
                        <Ionicons
                          name="information-circle-outline"
                          size={20}
                          color="#D97706"
                          style={{marginTop: 2}}
                        />
                        <View style={{flex: 1, marginLeft: 8}}>
                          <Text style={styles.pack72Title}>
                            7.2mg Pack Information
                          </Text>
                          <Text style={styles.pack72Text}>
                            Includes 4 single-dose pens. Other strengths are
                            supplied as 1 pen containing 4 doses.
                          </Text>
                        </View>
                      </View>
                    )}
                  </React.Fragment>
                );
              })}
          </View>
          {variation?.show_expiry === 1 && (
            <View>
              <Controller
                control={control}
                name="terms"
                defaultValue={false}
                rules={{
                  required: isExpiryRequired
                    ? 'Please confirm that you have read and acknowledged the expiry information.'
                    : false,
                }}
                render={({field: {onChange, value}}) => (
                  <CustomCheckbox
                    label="Please confirm that you have reviewed the expiry dates of the selected doses."
                    value={value}
                    onChange={onChange}
                  />
                )}
              />
              {errors.terms && (
                <Text style={{color: 'red', fontSize: 12, marginTop: -4}}>
                  {errors.terms.message}
                </Text>
              )}
            </View>
          )}

          {variation.addons?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Add‑ons</Text>
              {variation?.addons
                .slice()
                .sort((a, b) => {
                  const aOutOfStock =
                    a?.stock?.status === 0 || a?.stock?.quantity === 0 ? 1 : 0;
                  const bOutOfStock =
                    b?.stock?.status === 0 || b?.stock?.quantity === 0 ? 1 : 0;

                  return aOutOfStock - bOutOfStock;
                })
                .map(addon => {
                  const cartAddon = items.addons.find(
                    item => item.id === addon.id,
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

          <View style={styles.footerRight}>
            <NextButton
              style={{width: '100%'}}
              label="Proceed to Checkout"
              onPress={handleSubmit(onSubmit)}
              disabled={!isValid || totalSelectedQty() === 0}
            />
            <BackButton
              label="Back"
              onPress={() => navigation.navigate('confirmation-summary')}
            />
          </View>
        </ScrollView>

        <View style={[styles.footer, {paddingBottom: insets.bottom + 8}]}>
          <View style={styles.footerContent}>
            <Image source={{uri: variation.img}} style={styles.footerImg} />
            <View style={styles.footerDetails}>
              <Text style={styles.footerName} numberOfLines={1}>
                {variation.name}
              </Text>
              <Text style={styles.footerTotal}>
                Order total{' '}
                <Text style={styles.amount}>
                  £{parseFloat(totalAmount).toFixed(2)}
                </Text>
              </Text>
            </View>
          </View>
        </View>

        <Modal
          isVisible={showDoseModal}
          onBackdropPress={() => setShowDoseModal(false)}
          style={styles.modal}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dosage Confirmation</Text>
            <Text style={styles.modalText}>
              {selectedDose?.product_concent}
            </Text>
            <NextButton
              label={isWegovyPill ? 'I confirm this dose' : 'I Confirm'}
              onPress={() => setShowDoseModal(false)}
            />
          </View>
        </Modal>
      </View>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#F2EEFF'},
  container: {padding: 18},
  header: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
  title: {fontSize: 22, fontWeight: 'bold', marginVertical: 10},
  price: {fontSize: 18, marginBottom: 16},
  section: {
    backgroundColor: '#fff',
    marginVertical: 12,
    padding: 8,
    borderRadius: 8,
    paddingBottom: 30,
  },
  sectionTitle: {fontSize: 18, fontWeight: '600', padding: 10},

  modal: {justifyContent: 'center', margin: 0},
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 22,
    color: '#374151',
  },
  pack72Banner: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    marginBottom: 4,
  },
  pack72Title: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  pack72Text: {
    fontSize: 13,
    color: '#4B5563',
    marginTop: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerImg: {
    width: 56,
    height: 56,
    borderRadius: 14,
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  footerDetails: {
    flex: 1,
  },
  footerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111',
    marginBottom: 4,
  },
  footerTotal: {
    fontSize: 14,
    color: '#666',
  },
  amount: {
    color: '#000',
    fontWeight: '700',
  },

  footerRight: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'start',
    gap: 4,
    marginBottom: 90,
  },
  nextBtn: {
    flexGrow: 1, // 💥 let the button expand as needed
    maxWidth: 200, // optional minimum width
  },
});
