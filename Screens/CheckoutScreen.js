import React, {useEffect, useRef, useState} from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import Header from '../Layout/header';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';
import OrderSummary from '../Components/OrderSummary';
import BillingAddress from '../Components/BillingAddress';
import ProductConsent from '../Components/ProductConsent';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import ShippingAddress from '../Components/ShippingAddress';
import CheckoutSection from '../Components/CheckoutSection';
import BackButton from '../Components/BackButton';
import Toast from 'react-native-toast-message';

const PRIMARY = '#47317c';

export default function CheckoutSteps({navigation}) {
  const scrollRef = useRef();
  const sectionYRef = useRef({});

  const [isShippingCheck, setIsShippingCheck] = useState(false);
  const [isBillingCheck, setIsBillingCheck] = useState(false);
  const [isConcentCheck, setIsConcentCheck] = useState(false);
  const {billingSameAsShipping} = useShippingOrBillingStore();

  const [openStep, setOpenStep] = useState('shipping');

  const prevShipping = useRef(false);
  const prevBilling = useRef(false);
  const prevConsent = useRef(false);

  const insets = useSafeAreaInsets();
  const isNextDisabled =
    isShippingCheck &&
    (billingSameAsShipping || isBillingCheck) &&
    isConcentCheck;

  const scrollToStep = key => {
    setTimeout(() => {
      const y = sectionYRef.current[key];
      if (y != null && scrollRef.current) {
        scrollRef.current.scrollTo({y: Math.max(y - 12, 0), animated: true});
      }
    }, 350);
  };

  // Auto-advance: Shipping done → open Billing (or Consent if same-as-shipping)
  useEffect(() => {
    if (isShippingCheck && !prevShipping.current && openStep === 'shipping') {
      const nextStep = billingSameAsShipping ? 'consent' : 'billing';
      setOpenStep(nextStep);
      scrollToStep(nextStep);
    }
    prevShipping.current = isShippingCheck;
  }, [isShippingCheck, billingSameAsShipping]);

  // Auto-advance: Billing done → open Consent
  useEffect(() => {
    if (isBillingCheck && !prevBilling.current && openStep === 'billing') {
      setOpenStep('consent');
      scrollToStep('consent');
    }
    prevBilling.current = isBillingCheck;
  }, [isBillingCheck]);

  // Auto-advance: Consent given → open Order Summary
  useEffect(() => {
    if (isConcentCheck && !prevConsent.current && openStep === 'consent') {
      setOpenStep('summary');
      scrollToStep('summary');
    }
    prevConsent.current = isConcentCheck;
  }, [isConcentCheck]);

  const handleToggle = key => {
    setOpenStep(prev => (prev === key ? null : key));
  };

  return (
    <>
      <Header />
      <ScrollView
        ref={scrollRef}
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 32},
        ]}
        showsVerticalScrollIndicator={false}>
        <Text
          style={styles.heading}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.7}>
          Checkout to kick-start your weight loss journey
        </Text>

        <CheckoutSection
          stepNumber={1}
          title="Shipping Address"
          subtitle="Where should we deliver your order?"
          isCompleted={isShippingCheck}
          isOpen={openStep === 'shipping'}
          onToggle={() => handleToggle('shipping')}
          onLayout={e => {
            sectionYRef.current.shipping = e.nativeEvent.layout.y;
          }}>
          <ShippingAddress setIsShippingCheck={setIsShippingCheck} />
        </CheckoutSection>

        {!billingSameAsShipping && (
          <CheckoutSection
            stepNumber={2}
            title="Billing Address"
            subtitle="Where should we send your invoice?"
            isCompleted={isBillingCheck}
            isOpen={openStep === 'billing'}
            onToggle={() => handleToggle('billing')}
            onLayout={e => {
              sectionYRef.current.billing = e.nativeEvent.layout.y;
            }}>
            <BillingAddress setIsBillingCheck={setIsBillingCheck} />
          </CheckoutSection>
        )}

        <CheckoutSection
          stepNumber={billingSameAsShipping ? 2 : 3}
          title="Treatment Consent"
          subtitle="Please confirm you've reviewed the treatment information"
          isCompleted={isConcentCheck}
          isOpen={openStep === 'consent'}
          onToggle={() => handleToggle('consent')}
          onLayout={e => {
            sectionYRef.current.consent = e.nativeEvent.layout.y;
          }}>
          <ProductConsent setIsConcentCheck={setIsConcentCheck} />
        </CheckoutSection>

        <CheckoutSection
          stepNumber={billingSameAsShipping ? 3 : 4}
          title="Order Summary"
          subtitle="Review your items before payment"
          isCompleted={false}
          isOpen={openStep === 'summary'}
          onToggle={() => handleToggle('summary')}
          onLayout={e => {
            sectionYRef.current.summary = e.nativeEvent.layout.y;
          }}>
          <OrderSummary isNextDisabled={isNextDisabled} />
        </CheckoutSection>

        <BackButton
          label="Back"
          onPress={() => navigation.navigate('dose-selection')}
        />
      </ScrollView>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
  },
  heading: {
    fontSize: 18,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 18,
    textAlign: 'center',
  },
});
