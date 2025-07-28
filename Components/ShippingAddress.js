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
import TextFields from './TextFields';
import SelectField from './SelectField';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import PostcodeSearchInput from './PostcodeSearchInput';
import useShipmentCountries from '../store/useShipmentCountriesStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';
import {useFocusEffect} from '@react-navigation/native';
import SelectFields from './SelectFields';

const GETADDRESS_KEY = '_UFb05P76EyMidU1VHIQ_A42976';

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

export default function ShippingAddress({setIsShippingCheck}) {
  const {shipping, setShipping, setBilling, setBillingSameAsShipping} =
    useShippingOrBillingStore();
  const {shipmentCountries} = useShipmentCountries();

  const [showLoader, setShowLoader] = useState(false);
  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [shippingIndex, setShippingIndex] = useState('');
  const [countryChangedManually, setCountryChangedManually] = useState(false);

  console.log('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    getValues,
    control,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      first_name: '',
      last_name: '',
      postalcode: '',
      addressone: '',
      addresstwo: '',
      city: '',
      shippingCountry: '',
      same_as_shipping: false,
    },
  });

  const sameAsShippingValue = watch('same_as_shipping');

  // 2️⃣ Prefill form from Zustand `shipping`
  useFocusEffect(
    React.useCallback(() => {
      if (!shipmentCountries?.length || !shipping) return;

      setValue('postalcode', shipping.postalcode || '');
      setValue('first_name', shipping.first_name || '');
      setValue('last_name', shipping.last_name || '');
      setValue('addressone', shipping.addressone || '');
      setValue('addresstwo', shipping.addresstwo || '');
      setValue('city', shipping.city || '');

      const country = shipmentCountries.find(
        c => c.name === shipping.country_name,
      );

      if (country) {
        const idStr = country.id.toString();
        const currentValue = getValues('shippingCountry'); // ✅ one-time read

        if (currentValue !== idStr) {
          setValue('shippingCountry', idStr);
          setShippingIndex(idStr);
        }
      }
    }, []),
  );

  // 3️⃣ Auto-save to Zustand on any field change
  useFocusEffect(
    React.useCallback(() => {
      const subscription = watch(values => {
        const selectedCountry =
          shipmentCountries.find(
            c => c.id.toString() === values.shippingCountry,
          ) || shipmentCountries.find(c => c.id.toString() === shippingIndex);

        const updatedShipping = {
          id: selectedCountry?.id || '',
          country_name: selectedCountry?.name || '',
          country_price: selectedCountry?.price || '',
          postalcode: values.postalcode || '',
          addressone: values.addressone || '',
          first_name: values.first_name || '',
          last_name: values.last_name || '',
          addresstwo: values.addresstwo || '',
          city: values.city || '',
          state: '',
          same_as_shipping: values.same_as_shipping || false,
        };

        setShipping(updatedShipping);
      });

      return () => subscription.unsubscribe();
    }, [watch, shipmentCountries, shippingIndex, setShipping]),
  );

  useFocusEffect(
    React.useCallback(() => {
      if (sameAsShippingValue) {
        const selectedCountry = shipmentCountries.find(
          c => c.id.toString() === shippingIndex,
        );

        const shippingPayload = {
          id: selectedCountry?.id || '',
          country_name: selectedCountry?.name || '',
          country_price: selectedCountry?.price || '',
          postalcode: watch('postalcode'),
          first_name: watch('first_name'),
          last_name: watch('last_name'),
          addressone: watch('addressone'),
          addresstwo: watch('addresstwo'),
          city: watch('city'),
          state: '',
          same_as_shipping: true,
        };

        setShipping(shippingPayload); // ✅
        setBilling(shippingPayload); // ✅
      }

      setBillingSameAsShipping(sameAsShippingValue);
    }, [sameAsShippingValue]),
  );

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

  useFocusEffect(
    React.useCallback(() => {
      const checkFields = () => {
        const values = getValues(); // ✅ read immediately
        const requiredFields = [
          values.shippingCountry,
          values.first_name,
          values.last_name,
          values.postalcode,
          values.addressone,
          values.city,
        ];

        const allFilled = requiredFields.every(
          field => field && field.toString().trim() !== '',
        );

        setIsShippingCheck?.(allFilled);
      };

      // 🔁 run once on mount
      checkFields();

      // 🔁 run on form updates
      const subscription = watch(() => {
        checkFields();
      });

      return () => subscription.unsubscribe();
    }, [watch, getValues, setIsShippingCheck]),
  );

  const toggleCheckbox = (fieldOnChange, value) => {
    fieldOnChange(!value);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Shipping Information</Text>
        <Text style={styles.subtitle}>
          Update your shipping details — changes will apply to future orders
          only.
        </Text>

        <View style={{marginTop: 24}}>
          <Controller
            name="first_name"
            control={control}
            render={({field}) => (
              <TextFields
                label="First Name"
                value={field.value}
                onChangeText={field.onChange}
                errors={errors}
                required
              />
            )}
          />

          <Controller
            name="last_name"
            control={control}
            render={({field}) => (
              <TextFields
                label="Last Name"
                value={field.value}
                onChangeText={field.onChange}
                errors={errors}
                required
              />
            )}
          />

          <Controller
            name="shippingCountry"
            control={control}
            rules={{required: 'Country is required'}}
            render={({field}) => (
              <SelectFields
                label="Select Country"
                value={field.value}
                onChange={id => {
                  field.onChange(id);
                  setShippingIndex(id);
                  setCountryChangedManually(true);
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

          {addressOptions.length > 0 && (
            <Controller
              control={control}
              name="selectedAddress"
              rules={{required: 'Please select your address'}}
              render={({field: {onChange, value}}) => (
                <SelectFields
                  label="Select Your Address"
                  value={value}
                  onChange={idx => {
                    setSelectedIndex(idx);
                    const selected = addressOptions[idx];
                    onChange(idx);

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
                  error={errors?.selectedAddress?.message}
                />
              )}
            />
          )}

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
            name="same_as_shipping"
            control={control}
            render={({field}) => (
              <TouchableOpacity
                style={styles.checkboxRow}
                onPress={() => toggleCheckbox(field.onChange, field.value)}>
                {field.value ? (
                  <MaterialIcons name="check-box" size={24} color="#47317c" />
                ) : (
                  <MaterialIcons
                    name="check-box-outline-blank"
                    size={24}
                    color="#47317c"
                  />
                )}
                <Text style={{marginLeft: 10, fontSize: 14}}>
                  Make billing address same as shipping address
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {paddingBottom: 0},
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: {width: 0, height: 2},
    elevation: 2,
  },
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
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
});
