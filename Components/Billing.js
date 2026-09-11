import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useMutation} from '@tanstack/react-query';

import TextFields from './TextFields';
import SelectField from './SelectField';
import {getProfileData, sendProfileData} from '../api/myProfileApi';
import Ionicons from 'react-native-vector-icons/Ionicons';
import PostcodeSearchInput from './PostcodeSearchInput';
import {useFocusEffect} from '@react-navigation/native';
import NextButton from './NextButton';
import SelectFields from './SelectFields';
import {Fonts} from '../utils/fonts';
import Feather from 'react-native-vector-icons/Feather';

const PRIMARY = '#47317c';
const GETADDRESS_KEY = '_UFb05P76EyMidU1VHIQ_A42976';

// Fetch helper
const fetchAddresses = async postcode => {
  const res = await fetch(
    `https://api.getaddress.io/find/${encodeURIComponent(
      postcode,
    )}?api-key=${GETADDRESS_KEY}`,
  );
  if (!res.ok) throw new Error('Postcode lookup failed');
  const data = await res.json();
  return (data.addresses || []).map(addrStr => {
    const parts = addrStr
      .split(',')
      .map(p => p.trim())
      .filter(Boolean);
    return {
      formatted_address: parts,
      line_1: parts[0] || '',
      line_2: parts[1] || '',
      town_or_city: parts[parts.length - 2] || '',
      county: parts[parts.length - 1] || '',
    };
  });
};

export default function Billing({billingCountries}) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [billingIndex, setBillingIndex] = useState('');
  const [billing, setBilling] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [countryChangedManually, setCountryChangedManually] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      postalcode: '',
      addressone: '',
      addresstwo: '',
      city: '',
      state: '',
      billingCountry: '',
    },
  });

  const postalCodeValue = watch('postalcode');
  const selectedBillingCountry = watch('billingCountry');
  const selectedCountryObj = billingCountries?.find(
    c => c.id.toString() === selectedBillingCountry,
  );
  const allowedCountryNames = [
    'United Kingdom (Mainland)',
    'Channel Islands',
    'Northern Ireland',
  ];
  const isSearchAllowed =
    selectedCountryObj && allowedCountryNames.includes(selectedCountryObj.name);

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: res => {
      const billingData = res?.data?.profile?.billing;
      if (!billingData) return;
      setBilling(billingData);
    },
    onError: () => console.log('Failed to load profile data'),
  });

  useFocusEffect(
    React.useCallback(() => {
      if (billingCountries?.length) {
        getProfileDataMutation.mutate();
      }
    }, [billingCountries]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (!billing || !billingCountries?.length || countryChangedManually)
        return;

      setValue('postalcode', billing.postalcode || '');
      setValue('addressone', billing.addressone || '');
      setValue('addresstwo', billing.addresstwo || '');
      setValue('city', billing.city || '');
      setValue('state', billing.state || '');

      const country = billingCountries.find(
        c => c.name === billing.country_name || c.name === billing.country,
      );
      if (country) {
        setValue('billingCountry', country.id.toString(), {
          shouldValidate: true,
        });
        setBillingIndex(country.id.toString());
      }
    }, [billing, billingCountries]),
  );

  const handleSearch = async () => {
    if (!postalCodeValue?.trim()) return;
    try {
      setAddressSearchLoading(true);
      const results = await fetchAddresses(postalCodeValue);
      if (results.length) {
        setAddressOptions(results);
        setManual(true);
      } else {
        console.log('Invalid postcode');
      }
    } catch (err) {
      console.log('Address fetch failed:', err.message);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
      setShowLoader(false);
      console.log('Billing updated successfully!');
    },
    onError: error => {
      console.log(error?.response?.data?.message || 'Something went wrong');
    },
  });

  const onSubmit = data => {
    setShowLoader(true);
    const selectedCountry = billingCountries.find(
      c => c.id.toString() === billingIndex,
    );

    const formData = {
      billing: true,
      country_name: selectedCountry?.name || '',
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: data.state,
    };

    sendProfileDataMutation.mutate(formData);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.iconBox}>
            <Feather name="credit-card" size={19} color={PRIMARY} />
          </View>
          <View style={{flex: 1}}>
            <Text style={styles.title}>Billing information</Text>
            <Text style={styles.subtitle}>
              Update your billing details — changes will apply to future
              orders only.
            </Text>
          </View>
        </View>

        <View style={{marginTop: 22}}>
        {/* Country Dropdown */}
        <Controller
          name="billingCountry"
          control={control}
          rules={{required: 'Country is required'}}
          render={({field}) => (
            <SelectFields
              label="Select Country"
              value={field.value}
              onChange={id => {
                field.onChange(id);
                setBillingIndex(id);
                setCountryChangedManually(true);

                // ✅ Clear form fields
                [
                  'postalcode',
                  'addressone',
                  'addresstwo',
                  'city',
                  'state',
                ].forEach(k => setValue(k, ''));

                // ✅ Reset search-related state
                setManual(false);
                setAddressOptions([]);
              }}
              options={billingCountries.map(addr => ({
                value: addr.id.toString(),
                label: addr.name,
              }))}
              required
              error={errors.billingCountry}
            />
          )}
        />

        {/* Postcode + Search */}
        {/* Post-code + Search */}
        <View style={styles.relativeContainer}>
          <Controller
            name="postalcode"
            control={control}
            rules={{required: 'Postcode is required'}}
            render={({field}) => (
              <PostcodeSearchInput
                label="Post code"
                value={field.value}
                onChangeText={field.onChange}
                handleSearch={handleSearch}
                addressSearchLoading={addressSearchLoading}
                errors={errors?.postalcode?.message}
                isSearchAllowed={isSearchAllowed} // Pass the state that controls visibility
              />
            )}
          />
        </View>

        {/* Address dropdown after search */}
        {isSearchAllowed &&
          postalCodeValue?.trim() &&
          !addressSearchLoading &&
          addressOptions.length > 0 && (
            <SelectFields
              label="Select Your Address"
              value={selectedIndex}
              onChange={idx => {
                const selected = addressOptions[idx];
                setSelectedIndex(idx);
                setValue('addressone', selected.line_1 || '', {
                  shouldValidate: true,
                });
                setValue('addresstwo', selected.line_2 || '', {
                  shouldValidate: true,
                });
                setValue('city', selected.town_or_city || '', {
                  shouldValidate: true,
                });
                setValue('state', selected.county || '', {
                  shouldValidate: true,
                });
              }}
              options={addressOptions.map((addr, idx) => ({
                value: idx,
                label: addr.formatted_address.join(', '),
              }))}
              required
            />
          )}

        {/* Address fields */}
        <Controller
          name="addressone"
          control={control}
          render={({field}) => (
            <TextFields
              label="Address"
              value={field.value}
              onChangeText={field.onChange}
              required
              errors={errors}
            />
          )}
        />
        <Controller
          name="addresstwo"
          control={control}
          render={({field}) => (
            <TextFields
              label="Address 2"
              value={field.value}
              onChangeText={field.onChange}
              errors={errors}
            />
          )}
        />
        <Controller
          name="city"
          control={control}
          render={({field}) => (
            <TextFields
              label="Town / City"
              value={field.value}
              onChangeText={field.onChange}
              required
              errors={errors}
            />
          )}
        />
        <Controller
          name="state"
          control={control}
          render={({field}) => (
            <TextFields
              label="State / County"
              value={field.value}
              onChangeText={field.onChange}
              errors={errors}
            />
          )}
        />
        <View style={styles.buttonWrap}>
          <NextButton
            disabled={!isValid}
            label="Update billing"
            onPress={handleSubmit(onSubmit)}
            loading={showLoader}
            style={styles.submitButton}
          />
        </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {paddingBottom: 20},
  card: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 20,
    backgroundColor: '#fff',
    padding: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.07)',
    paddingBottom: 18,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonWrap: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(71, 49, 124, 0.07)',
    paddingTop: 18,
    marginTop: 4,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 13,
    minHeight: 46,
  },
  title: {
    fontSize: 18,
    color: '#0f172a',
    fontFamily: Fonts.bold,
  },
  subtitle: {
    fontSize: 12.5,
    color: '#64748b',
    marginTop: 4,
    lineHeight: 17,
    fontFamily: Fonts.regular,
  },
  postcodeRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginTop: 16,
  },
  searchBtn: {
    backgroundColor: '#6B21A8',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    backgroundColor: '#6B21A8',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitDisabled: {
    backgroundColor: '#aaa',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  relativeContainer: {
    position: 'relative',
  },
  insideSearchButton: {
    position: 'absolute',
    right: 0,
    top: 25,
    backgroundColor: '#4B0082',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
