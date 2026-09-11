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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const AddressBookScreen = () => {
  const [tabActive, setTabActive] = useState('shipping');
  const insets = useSafeAreaInsets();
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
        contentContainerStyle={[styles.wrapper, {paddingBottom: insets.bottom + 16}]}
        showsVerticalScrollIndicator={false}>
        {/* Page header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageLabel}>ADDRESS BOOK</Text>
          <Text style={styles.pageTitle}>My Address Book</Text>
          <Text style={styles.pageSubtitle}>
            Manage shipping and billing address for your orders.
          </Text>
        </View>

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
    activeOpacity={0.8}
    style={[styles.tabButton, isActive && styles.tabButtonActive]}>
    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/* --- Styles --- */

const styles = StyleSheet.create({
  wrapper: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#FBFBFD',
  },

  // Page header
  pageHeader: {
    borderWidth: 1,
    borderColor: '#e4e0f5',
    borderRadius: 16,
    backgroundColor: '#fbfaff',
    padding: 18,
    marginBottom: 16,
  },
  pageLabel: {
    fontSize: 10,
    fontFamily: Fonts.semiBold,
    color: 'rgba(71, 49, 124, 0.7)',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 21,
    fontFamily: Fonts.bold,
    color: '#0f172a',
    marginBottom: 4,
  },
  pageSubtitle: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 17,
  },

  // Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#f1f0f7',
    borderRadius: 14,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 11,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#fff',
    shadowColor: '#24003D',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    color: '#64748b',
    fontFamily: Fonts.medium,
  },
  tabTextActive: {
    color: PRIMARY,
    fontFamily: Fonts.semiBold,
  },
});

export default AddressBookScreen;
