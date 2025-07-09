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
import Ionicons from 'react-native-vector-icons/Ionicons';

import {getProfileData, sendProfileData} from '../api/myProfileApi';
import PostcodeSearchInput from './PostcodeSearchInput';

const GETADDRESS_KEY = '_UFb05P76EyMidU1VHIQ_A42976';

// ✅ Helper to fetch addresses from getaddress.io
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
    };
  });
};

export default function Shipping({shipmentCountries}) {
  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [shipping, setShipping] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [shippingIndex, setShippingIndex] = useState('');
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
      shippingCountry: '',
    },
  });

  const getProfileDataMutation = useMutation(getProfileData, {
    onSuccess: res => {
      const shippingData = res?.data?.profile?.shipping;
      if (!shippingData) return;

      setValue('postalcode', shippingData.postalcode || '');
      setValue('addressone', shippingData.addressone || '');
      setValue('addresstwo', shippingData.addresstwo || '');
      setValue('city', shippingData.city || '');

      const country = shipmentCountries?.find(
        c => c.name === shippingData.country,
      );
      if (country) {
        setValue('shippingCountry', country.id.toString(), {
          shouldValidate: true,
        });
        setShippingIndex(country.id.toString());
      }
    },
    onError: () => console.log('Profile fetch failed'),
  });

  useEffect(() => {
    if (shipmentCountries?.length) getProfileDataMutation.mutate();
  }, [shipmentCountries]);

  useEffect(() => {
    if (countryChangedManually) {
      setValue('postalcode', '');
      setValue('addressone', '');
      setValue('addresstwo', '');
      setValue('city', '');
    }
  }, [shippingIndex]);

  const handleSearch = async () => {
    const postal = watch('postalcode')?.trim();
    if (!postal) {
      console.log('Please enter a postcode.');
      return;
    }

    try {
      setAddressSearchLoading(true);
      const results = await fetchAddresses(postal);
      if (results.length) {
        setAddressOptions(results);
        setManual(true);
      } else {
        console.log('No addresses found.');
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  const sendProfileDataMutation = useMutation(sendProfileData, {
    onSuccess: () => {
      setShowLoader(false);
      console.log('Shipping updated successfully!');
    },
    onError: err =>
      console.log(err?.response?.data?.message || 'Something went wrong.'),
  });

  const onSubmit = data => {
    setShowLoader(true);

    const selectedCountry = shipmentCountries.find(
      c => c.id.toString() === shippingIndex,
    );

    const formData = {
      shipping: true,
      country_name: selectedCountry?.name || '',
      postalcode: data.postalcode,
      addressone: data.addressone,
      addresstwo: data.addresstwo,
      city: data.city,
      state: '',
    };

    sendProfileDataMutation.mutate(formData);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <Text style={styles.title}>Shipping Information</Text>
        <Text style={styles.subtitle}>
          Update your shipping details — changes will apply to future orders
          only.
        </Text>

        {/* Form */}
        <View style={{marginTop: 24}}>
          {/* Country Dropdown */}
          <Controller
            name="shippingCountry"
            control={control}
            rules={{required: 'Country is required'}}
            render={({field}) => (
              <SelectField
                label="Select Country"
                value={field.value}
                onChange={id => {
                  field.onChange(id);
                  setShippingIndex(id);
                  setCountryChangedManually(true);

                  const sel = shipmentCountries.find(
                    c => c.id.toString() === id,
                  );
                  if (sel) {
                    setShipping({
                      id: sel.id,
                      country_name: sel.name,
                      country_price: sel.price,
                    });
                  }
                }}
                options={(shipmentCountries || []).map(c => ({
                  value: c.id.toString(),
                  label: c.name,
                }))}
                required
                error={errors.shippingCountry}
              />
            )}
          />

          {/* Postcode & Search */}
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
                />
              )}
            />
          </View>

          {/* Address dropdown after search */}
          {/* Conditional rendering of the address selection dropdown */}
          {manual && addressOptions.length > 0 && (
            <Controller
              name="addressone" // You can change this to any form field name like "addressone"
              control={control}
              render={({field}) => (
                <SelectField
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
                  }}
                  options={addressOptions.map((addr, idx) => ({
                    value: idx,
                    label: addr.formatted_address.join(', '),
                  }))}
                  required
                  error={errors?.addressone?.message}
                />
              )}
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
                placeholder="123 Main Street"
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
                placeholder="Flat 14"
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
                placeholder="e.g., London"
                required
                errors={errors}
              />
            )}
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitBtn, !isValid && styles.submitDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={!isValid}>
            <Text style={styles.submitText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {paddingBottom: 60},
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
  },
  subtitle: {
    fontSize: 14,
    color: '#444',
    marginTop: 6,
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
