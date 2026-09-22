import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Modal from 'react-native-modal';
import DateTimePicker from '@react-native-community/datetimepicker';
import {Controller, useForm} from 'react-hook-form';
import Toast from 'react-native-toast-message';
import Feather from 'react-native-vector-icons/Feather';
import useCartStore from '../store/useCartStore';
import useVariationStore from '../store/useVariationStore';
import useAbandonCardStore from '../store/useAbandonCardStore';
import useReorder from '../store/useReorderStore';
import BackButton from '../Components/BackButton';
import Header from '../Layout/header';
import Dose from '../Components/Dose';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';
import Addon from '../Components/addon';
import NextButton from '../Components/NextButton';
import useProductId from '../store/useProductIdStore';
import {abandonCart} from '../api/abandonCartApi';
import CustomCheckbox from '../Components/CustomCheckbox';
import {useFocusEffect} from '@react-navigation/native';

const PRIMARY = '#47317c';

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

  const {variation} = useVariationStore();
  const [loadTimeout, setLoadTimeout] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoadTimeout(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  const [isExpiryRequired, setIsExpiryRequired] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const hasExpiryDose = (variation?.variations || []).some(dose =>
        Boolean(dose?.expiry),
      );
      if (hasExpiryDose) {
        setIsExpiryRequired(true);
        setTimeout(() => {
          setValue('terms', false, {shouldValidate: true});
        }, 0);
      } else {
        setIsExpiryRequired(false);
        clearErrors('terms');
        setValue('terms', false);
      }
    }, [variation?.variations, clearErrors, setValue]),
  );

  const {
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItemCompletely,
    setConsentGiven,
    items,
    totalAmount,
  } = useCartStore();
  const {reorder} = useReorder();
  const {productId} = useProductId();
  const insets = useSafeAreaInsets();
  const isWegovyPill = Number(productId) === 7 || Number(productId) === 11;
  const {abandonCard, extra} = useAbandonCardStore();
  const abandonAddedRef = useRef(false);
  const cleanedUpRef = useRef(false);

  const [showDoseModal, setShowDoseModal] = useState(false);
  const [selectedDose, setSelectedDose] = useState(null);
  const [prevMedication, setPrevMedication] = useState('');
  const [prevDose, setPrevDose] = useState('');
  const [lastTakenDate, setLastTakenDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const totalSelectedQty = () => items?.doses?.reduce((t, d) => t + d.qty, 0);
  const currentQty = totalSelectedQty();

  // Any dose that requires consent but hasn't been consented to yet gets removed —
  // mirrors web behaviour so a killed modal never leaves a "ghost" cart item.
  useEffect(() => {
    if (cleanedUpRef.current) return;
    cleanedUpRef.current = true;
    items.doses.forEach(dose => {
      if (dose.product_concent && !dose.consentGiven) {
        removeItemCompletely(dose.id, 'dose');
      }
    });
  }, []);

  const onSubmit = () => {
    navigation.navigate('checkout');
  };

  const generateProductConcent = (vars, selectedName) => {
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

    if (isFirstDose || reorder) {
      addToCart({
        id: dose.id,
        type: 'dose',
        name: dose.name,
        price: parseFloat(dose.price),
        allowed: parseInt(dose.allowed),
        item_id: dose.id,
        product: variation.name,
        product_concent: null,
        label: `${variation.name} ${dose.name}`,
        expiry: dose.expiry,
        isSelected: true,
      });

      abandonCart({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      }).catch(() => {});
    } else {
      const product_concent = generateProductConcent(
        variation.variations,
        dose.name,
      );

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

      abandonCart({
        eid: dose.id,
        pid: productId || abandonCard?.productId,
      }).catch(() => {});

      setSelectedDose({...dose, product_concent});
      setShowDoseModal(true);
    }
  };

  const closeDoseModalWithoutConsent = () => {
    if (selectedDose?.id) {
      removeItemCompletely(selectedDose.id, 'dose');
    }
    setPrevMedication('');
    setPrevDose('');
    setLastTakenDate(null);
    setShowDoseModal(false);
    setSelectedDose(null);
  };

  const confirmDoseConsent = () => {
    if (!prevMedication.trim() || !prevDose.trim() || !lastTakenDate) return;

    const dd = String(lastTakenDate.getDate()).padStart(2, '0');
    const mm = String(lastTakenDate.getMonth() + 1).padStart(2, '0');
    const yyyy = lastTakenDate.getFullYear();

    setConsentGiven(selectedDose.id, {
      medication_name: prevMedication.trim(),
      dosage: prevDose.trim(),
      dosage_time: `${dd}/${mm}/${yyyy}`,
    });

    setPrevMedication('');
    setPrevDose('');
    setLastTakenDate(null);
    setShowDoseModal(false);
    setSelectedDose(null);
  };

  useEffect(() => {
    if (abandonAddedRef.current) return;
    if (abandonCard?.type !== 'abandoned-cart') return;
    if (!extra || !variation?.variations) return;
    abandonAddedRef.current = true;
    handleAddDose(extra);
  }, [abandonCard?.type, extra, variation?.variations]);

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

  const isConfirmDisabled =
    !prevMedication.trim() || !prevDose.trim() || !lastTakenDate;

  if (!variation?.variations) {
    if (loadTimeout) {
      return (
        <View style={styles.loaderScreen}>
          <Text style={styles.loaderText}>
            Something went wrong loading dose options.
          </Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('gathering-data')}
            style={styles.retryButton}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return (
      <View style={styles.loaderScreen}>
        <ActivityIndicator size="large" color={PRIMARY} />
      </View>
    );
  }

  return (
    <>
      <View style={styles.screen}>
        <Header />
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {paddingBottom: insets.bottom + 130},
          ]}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.pageTitle}>
            You're ready to start your personal weight loss journey
          </Text>

          {/* Product card */}
          <View style={styles.productCard}>
            <View style={styles.productImageBox}>
              <Image
                source={{uri: variation.img}}
                style={styles.productImage}
              />
            </View>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{variation.name}</Text>
              {variation.name === 'Mounjaro (Tirzepatide)' && (
                <View style={styles.needlesBadge}>
                  <Text style={styles.needlesBadgeText}>
                    Pack of 5 Needles is included with every dose
                  </Text>
                </View>
              )}
              <Text style={styles.productPrice}>
                From £{parseFloat(variation.price || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {/* Dosage section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Choose your dosage</Text>
            {variation?.variations
              ?.slice()
              .sort((a, b) => {
                const aOutOfStock = a?.stock?.status === 0;
                const bOutOfStock = b?.stock?.status === 0;
                const qOutOfStock = b?.stock?.quantity === 0;
                const qaOutOfStock = a?.stock?.quantity === 0;

                if (qaOutOfStock && !qOutOfStock) return 1;
                if (!qaOutOfStock && qOutOfStock) return -1;
                if (aOutOfStock && !bOutOfStock) return 1;
                if (!aOutOfStock && bOutOfStock) return -1;
                return 0;
              })
              .map(dose => {
                const cartDose = items.doses.find(item => item.id === dose.id);
                const cartQty = cartDose?.qty || 0;
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
                        <Feather
                          name="info"
                          size={16}
                          color="#b45309"
                          style={{marginTop: 2}}
                        />
                        <View style={{flex: 1, marginLeft: 10}}>
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

          {isExpiryRequired && (
            <View style={styles.expiryBox}>
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
                <Text style={styles.expiryError}>{errors.terms.message}</Text>
              )}
            </View>
          )}

          {variation.addons?.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Select Add-ons</Text>
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
        </ScrollView>

        {/* Sticky bottom bar */}
        <View style={[styles.footer, {paddingBottom: insets.bottom + 10}]}>
          <View style={styles.footerSummaryRow}>
            <View style={styles.footerProduct}>
              <Image source={{uri: variation.img}} style={styles.footerImg} />
              <Text style={styles.footerName} numberOfLines={1}>
                {variation.name}
              </Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={styles.footerTotalLabel}>ORDER TOTAL</Text>
              <Text style={styles.footerTotalValue}>
                £{parseFloat(totalAmount || 0).toFixed(2)}
              </Text>
            </View>
          </View>

          {(currentQty === 0 || (isExpiryRequired && !isValid)) && (
            <Text style={styles.footerHint}>
              {currentQty === 0
                ? 'Select at least one dose to continue.'
                : 'Confirm the expiry dates to continue.'}
            </Text>
          )}

          <View style={styles.footerActionRow}>
            <TouchableOpacity
              style={styles.footerBack}
              onPress={() => navigation.navigate('confirmation-summary')}>
              <Feather name="chevron-left" size={16} color="#64748b" />
              <Text style={styles.footerBackText}>Back</Text>
            </TouchableOpacity>
            <View style={{flex: 1}}>
              <NextButton
                label="Proceed to Checkout"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || currentQty === 0}
                style={styles.submitButton}
              />
            </View>
          </View>
        </View>
      </View>

      {/* Dose confirmation modal */}
      <Modal
        isVisible={showDoseModal}
        onBackdropPress={closeDoseModalWithoutConsent}
        style={styles.modal}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Dosage Confirmation</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={closeDoseModalWithoutConsent}>
                <Feather name="x" size={16} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={{maxHeight: 420}}
              showsVerticalScrollIndicator={false}>
              {selectedDose?.product_concent && (
                <Text style={styles.modalDescription}>
                  {selectedDose.product_concent}
                </Text>
              )}

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>Previous medication name</Text>
                <TextInput
                  value={prevMedication}
                  onChangeText={setPrevMedication}
                  placeholder="e.g. Ozempic, Mounjaro, Wegovy"
                  placeholderTextColor="#94a3b8"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>
                  What dose were you on? (mg)
                </Text>
                <TextInput
                  value={prevDose}
                  onChangeText={setPrevDose}
                  placeholder="e.g. 2.5"
                  placeholderTextColor="#94a3b8"
                  style={styles.modalInput}
                />
              </View>

              <View style={styles.modalField}>
                <Text style={styles.modalLabel}>
                  When did you last take it?
                </Text>
                <TouchableOpacity
                  style={styles.modalDateInput}
                  activeOpacity={0.8}
                  onPress={() => setShowDatePicker(true)}>
                  <Text
                    style={[
                      styles.modalDateText,
                      !lastTakenDate && styles.modalDatePlaceholder,
                    ]}>
                    {lastTakenDate
                      ? lastTakenDate.toLocaleDateString('en-GB')
                      : 'DD/MM/YYYY'}
                  </Text>
                  <Feather name="calendar" size={16} color="#94a3b8" />
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={lastTakenDate || new Date()}
                    mode="date"
                    display={Platform.OS === 'android' ? 'calendar' : 'spinner'}
                    maximumDate={new Date()}
                    onChange={(event, selectedDate) => {
                      setShowDatePicker(false);
                      if (selectedDate) setLastTakenDate(selectedDate);
                    }}
                  />
                )}
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                isConfirmDisabled && styles.modalConfirmButtonDisabled,
              ]}
              disabled={isConfirmDisabled}
              onPress={confirmDoseConsent}>
              <Text style={styles.modalConfirmButtonText}>
                {isWegovyPill ? 'I confirm this dose' : 'I Confirm'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: '#FBFBFD'},
  container: {padding: 16},

  loaderScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FBFBFD',
    padding: 24,
  },
  loaderText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  retryButtonText: {
    color: '#fff',
    fontFamily: Fonts.semiBold,
    fontSize: 14,
  },

  pageTitle: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    textAlign: 'center',
    lineHeight: 27,
    marginBottom: 20,
  },

  // Product card
  productCard: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.08)',
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: 'rgba(71, 49, 124, 0.1)',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  productImageBox: {
    backgroundColor: PRIMARY,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  productImage: {
    width: 180,
    height: 130,
    resizeMode: 'contain',
  },
  productInfo: {
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  productName: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  needlesBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginTop: 8,
  },
  needlesBadgeText: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: PRIMARY,
  },
  productPrice: {
    fontSize: 13.5,
    fontFamily: Fonts.medium,
    color: '#64748b',
    marginTop: 8,
  },

  // Section card
  section: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.08)',
    borderRadius: 18,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: 'rgba(71, 49, 124, 0.1)',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 1,
    shadowRadius: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 8,
  },

  pack72Banner: {
    flexDirection: 'row',
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
  },
  pack72Title: {
    fontSize: 12.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  pack72Text: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#78716c',
    marginTop: 2,
    lineHeight: 17,
  },

  expiryBox: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#FBFBFD',
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
  },
  expiryError: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#ef4444',
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 16,
  },

  // Sticky footer
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: 'rgba(255,255,255,0.98)',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  footerSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  footerProduct: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  footerImg: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(71, 49, 124, 0.1)',
  },
  footerName: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  footerTotalLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: '#94a3b8',
    letterSpacing: 1,
  },
  footerTotalValue: {
    fontSize: 16,
    fontFamily: Fonts.semiBold,
    color: PRIMARY,
  },
  footerHint: {
    fontSize: 11.5,
    fontFamily: Fonts.medium,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  footerBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 12,
    paddingHorizontal: 4,
  },
  footerBackText: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#64748b',
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 48,
  },

  // Modal
  modal: {
    justifyContent: 'center',
    margin: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 17,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDescription: {
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 19,
    marginBottom: 16,
  },
  modalField: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#334155',
    marginBottom: 6,
  },
  modalInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#1e293b',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  modalDateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(248, 250, 252, 0.5)',
  },
  modalDateText: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#1e293b',
  },
  modalDatePlaceholder: {
    color: '#94a3b8',
  },
  modalConfirmButton: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  modalConfirmButtonDisabled: {
    backgroundColor: '#c8c1da',
  },
  modalConfirmButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: Fonts.semiBold,
  },
});
