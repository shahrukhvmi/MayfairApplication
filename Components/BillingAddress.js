import React, {useEffect, useState, useRef} from 'react';
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
import useBillingCountries from '../store/useBillingCountriesStore';
import useShippingOrBillingStore from '../store/shipingOrbilling';

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
      county: parts[parts.length - 1] || '',
    };
  });
};

export default function BillingAddress({sameAsShipping, setIsBillingCheck}) {
  const {billing, setBilling, shipping, clearBilling} =
    useShippingOrBillingStore();
  const {billingCountries} = useBillingCountries();
  const prevBillingRef = useRef({});

  const [manual, setManual] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');
  const [billingIndex, setBillingIndex] = useState('');
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);

  const {
    control,
    setValue,
    watch,
    formState: {errors},
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

  const selectedCountryObj = (billingCountries || []).find(
    c => c.id.toString() === selectedBillingCountry,
  );

  const allowedCountryNames = [
    'United Kingdom (Mainland)',
    'Channel Islands',
    'Northern Ireland',
  ];
  const isSearchAllowed =
    selectedCountryObj && allowedCountryNames.includes(selectedCountryObj.name);

  useEffect(() => {
    const selectedCountryObj = (billingCountries || []).find(
      c => c.id.toString() === selectedBillingCountry,
    );

    const isAllowed =
      selectedCountryObj &&
      allowedCountryNames.includes(selectedCountryObj.name);

    if (!isAllowed && selectedCountryObj) {
      clearBilling();
      setValue('postalcode', '');
      setValue('addressone', '');
      setValue('addresstwo', '');
      setValue('city', '');
      setValue('state', '');
    }
  }, [selectedBillingCountry, billingCountries]);

  useEffect(() => {
    if (shipping?.same_as_shipping) {
      setValue('postalcode', shipping.postalcode || '');
      setValue('addressone', shipping.addressone || '');
      setValue('addresstwo', shipping.addresstwo || '');
      setValue('city', shipping.city || '');
      setValue('state', shipping.state || '');

      const country = billingCountries.find(
        c => c.name === shipping.country_name,
      );
      if (country) {
        setValue('billingCountry', country.id.toString());
        setBillingIndex(country.id.toString());
      }
    } else if (billing) {
      setValue('postalcode', billing.postalcode || '');
      setValue('addressone', billing.addressone || '');
      setValue('addresstwo', billing.addresstwo || '');
      setValue('city', billing.city || '');
      setValue('state', billing.state || '');

      const country = billingCountries.find(
        c => c.name === billing.country_name,
      );
      if (country) {
        setValue('billingCountry', country.id.toString());
        setBillingIndex(country.id.toString());
      }
    }
  }, [shipping, billing, billingCountries]);

  const handleSearch = async () => {
    const postal = postalCodeValue?.trim();
    if (!postal) return;

    try {
      setAddressSearchLoading(true);
      const results = await fetchAddresses(postal);
      if (results.length) {
        setAddressOptions(results);
        setManual(true);
      }
    } catch (err) {
      console.log(err.message);
    } finally {
      setAddressSearchLoading(false);
    }
  };

  useEffect(() => {
    const subscription = watch(values => {
      const selectedCountry =
        billingCountries.find(c => c.id.toString() === values.billingCountry) ||
        billingCountries.find(c => c.id.toString() === billingIndex);

      const updatedBilling = {
        id: selectedCountry?.id || '',
        country_name: selectedCountry?.name || '',
        country_price: selectedCountry?.price || '',
        postalcode: values.postalcode || '',
        addressone: values.addressone || '',
        addresstwo: values.addresstwo || '',
        city: values.city || '',
        state: values.state || '',
        same_as_shipping: false,
      };

      const prev = prevBillingRef.current;
      const hasChanged =
        JSON.stringify(prev) !== JSON.stringify(updatedBilling);

      if (hasChanged) {
        prevBillingRef.current = updatedBilling;
        setBilling(updatedBilling);
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, billingCountries, billingIndex, setBilling]);

  useEffect(() => {
    const fields = watch([
      'billingCountry',
      'postalcode',
      'addressone',
      'city',
    ]);
    const allFilled = fields.every(field => field && field !== '');
    setIsBillingCheck(allFilled);
  }, [
    watch(['billingCountry', 'postalcode', 'addressone', 'city']),
    setIsBillingCheck,
  ]);

  if (sameAsShipping) return null;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled">
      <View style={styles.card}>
        <Text style={styles.title}>Billing Information</Text>

        <Controller
          name="billingCountry"
          control={control}
          rules={{required: 'Country is required'}}
          render={({field}) => (
            <SelectField
              label="Select Country"
              value={field.value}
              onChange={id => {
                field.onChange(id);
                setBillingIndex(id);
              }}
              options={(billingCountries || []).map(c => ({
                value: c.id.toString(),
                label: c.name,
              }))}
              required
              error={errors.billingCountry}
            />
          )}
        />

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

        {manual && addressOptions.length > 0 && (
          <Controller
            name="addressone"
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
                  setValue('state', selected.county || '', {
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

        <Controller
          name="state"
          control={control}
          render={({field}) => (
            <TextFields
              label="State / County"
              value={field.value}
              onChangeText={field.onChange}
              placeholder="e.g., Essex"
              errors={errors}
            />
          )}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {paddingBottom: 60},
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
});
