import React, { useEffect, useState } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Header from '../Layout/header';
import { useMutation } from '@tanstack/react-query';
import { getProfileData } from '../api/myProfileApi';
import Shipping from '../Components/Shipping';
import Billing from '../Components/Billing';
import { useFocusEffect } from '@react-navigation/native';

const AddressBookScreen = () => {
  const [tabActive, setTabActive] = useState('shipping');
  const [billingCountries, setBillingCountries] = useState([]);
  const [shipmentCountries, setShipmentCountries] = useState([]);

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: data => {
      setBillingCountries(data?.data?.profile?.billing_countries);
      setShipmentCountries(data?.data?.profile?.shippment_countries);
    },
    onError: error => {
      // replace with your toast implementation
      console.warn(error?.response?.data?.message || 'Something went wrong.');
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      getProfileDataMutation.mutate();
    }, []));
  return (
    <>
      <Header />

      <ScrollView
        contentContainerStyle={styles.wrapper}
        showsVerticalScrollIndicator={false}>
        {/* Tabs */}
        <View style={styles.tabRow}>
          <TabButton
            label="Shipping Address"
            isActive={tabActive === 'shipping'}
            onPress={() => setTabActive('shipping')}
          />
          <TabButton
            label="Billing Address"
            isActive={tabActive === 'billing'}
            onPress={() => setTabActive('billing')}
          />
        </View>

        {/* Body */}
        {tabActive === 'shipping' ? (
          <Shipping shipmentCountries={shipmentCountries} />
        ) : (
          <Billing billingCountries={billingCountries} />
        )}
      </ScrollView>
    </>
  );
};

/* --- Reusable tab button --- */

const TabButton = ({ label, isActive, onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tabButton, isActive && styles.tabButtonActive]}>
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {label}
    </Text>
    {isActive && <View style={styles.tabUnderline} />}
  </TouchableOpacity>
);

/* --- Styles --- */

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    padding: 24,
    backgroundColor: '#F9FAFB',
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
  },
  tabButton: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tabButtonActive: {
    // active text color handled separately; underline drawn below
  },
  tabText: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#6B21A8', // violet-700
    fontWeight: '700',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#6B21A8', // violet-700
    borderRadius: 2,
  },
});

export default AddressBookScreen;
