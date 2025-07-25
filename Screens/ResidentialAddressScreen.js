import React, { useEffect, useState } from 'react';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useForm, Controller } from 'react-hook-form';

import Header from '../Layout/header';
import TextField from '../Components/TextFields';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

import usePatientInfoStore from '../store/patientInfoStore';
import SelectFields from '../Components/SelectFields';
import TextFields from '../Components/TextFields';

// --- GETADDRESS.IO HELPER ---
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
      country: parts[parts.length - 1] || '',
    };
  });
};

export default function ResidentialAddressScreen() {
  const navigation = useNavigation();
  const { patientInfo, setPatientInfo } = usePatientInfoStore();


  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [searching, setSearching] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      postcode: '',
      address1: '',
      address2: '',
      city: '',
      country: '',
    },
  });

  const address1 = watch('address1');
  const city = watch('city');
  const country = watch('country');
  const postcode = watch('postcode');

  const isNextEnabled =
    !!address1?.trim() && !!city?.trim() && !!country?.trim();
  useEffect(() => {
    if (patientInfo?.address) {
      setValue('postcode', patientInfo.address.postalcode || '');
      setValue('address1', patientInfo.address.addressone || '');
      setValue('address2', patientInfo.address.addresstwo || '');
      setValue('city', patientInfo.address.city || '');
      setValue('country', patientInfo.address.country || '');

      // if (
      //   patientInfo.address.addressone ||
      //   patientInfo.address.addresstwo ||
      //   patientInfo.address.city ||
      //   patientInfo.address.country
      // ) {
      //   setShowManual(true);
      // }
    }
  }, [patientInfo])



  const onSubmit = data => {
    const fullAddress = {
      postalcode: data.postcode,
      addressone: data.address1,
      addresstwo: data.address2,
      city: data.city,
      state: '',
      country: data.country,
    };

    setPatientInfo({ ...patientInfo, address: fullAddress });
    navigation.navigate('preferred-phone-number');
  };


  const handleSearch = async () => {
    if (!postcode || postcode.trim().length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Missing Postcode',
        text2: 'Please enter a valid postcode',
      });
      return;
    }

    try {
      setSearching(true);
      const addresses = await fetchAddresses(postcode.trim());

      if (!addresses || addresses.length === 0) {
        Toast.show({
          type: 'error',
          text1: 'No Results',
          text2: 'No addresses found for this postcode',
        });
        setSearching(false);
        return;
      }

      setAddressOptions(addresses);
      // setShowManual(true);
    } catch (err) {
      console.error(err, 'Error in address search');
      logApiError(err, 'address search failed');

      Toast.show({
        type: 'error',
        text1: 'Postal Code Error',
        text2: err?.message || 'Something went wrong while searching addresses',
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressBarBackground}>
          <View style={styles.progressBarFill} />
        </View>
        <Text style={styles.progressText}>40% Completed</Text>

        <Text style={styles.heading}>Patient Residential Address</Text>
        <Text style={styles.subtext}>
          Required for age verification purpose
        </Text>

        {/* Postcode with button */}

        <View style={styles.relativeContainer}>
          <Controller
            control={control}
            name="postcode"
            render={({ field: { onChange, value } }) => (
              <TextFields
                label={"Postcode"}
                required
                value={value}
                onChangeText={onChange}
                style={{ position: 'relative' }}

              />
            )}
          />

          <TouchableOpacity
            style={[
              styles.insideSearchButton,
              searching && { opacity: 0.6 },
            ]}
            onPress={handleSearch}
            disabled={searching}
          >
            {searching ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="search" size={18} color="#fff" />
            )}
          </TouchableOpacity>
        </View>


        {/* Address dropdown */}
        {addressOptions.length > 0 && (
          <Controller
            control={control}
            name="selectedAddress"
            rules={{ required: 'Please select your address' }}
            render={({ field: { onChange, value } }) => (
              <SelectFields
                label="Select Your Address"
                value={value}
                onChange={idx => {
                  setSelectedIndex(idx);
                  const selected = addressOptions[idx];
                  onChange(idx);

                  setValue('address1', selected.line_1 || '', {
                    shouldValidate: true,
                  });
                  setValue('address2', selected.line_2 || '', {
                    shouldValidate: true,
                  });
                  setValue('city', selected.town_or_city || '', {
                    shouldValidate: true,
                  });
                  setValue('country', selected.country || '', {
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



        {/* Manual Address Fields */}

        <Controller
          control={control}
          name="address1"
          render={({ field: { onChange, value } }) => (
            <TextFields
              label={"Address"}
              required
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="address2"
          render={({ field: { onChange, value } }) => (
            <TextFields
              label={"Address 2"}

              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="city"
          render={({ field: { onChange, value } }) => (
            <TextFields
              required
              label={"City"}
              value={value}
              onChangeText={onChange}
            />
          )}
        />
        <Controller
          control={control}
          name="country"
          render={({ field: { onChange, value } }) => (
            <TextFields
              label={"Country"}
              required
              value={value}
              onChangeText={onChange}
            />
          )}
        />



        <NextButton
          label="Next"
          disabled={!isNextEnabled}
          onPress={handleSubmit(onSubmit)}
        />
        <BackButton label="Back" onPress={() => navigation.goBack()} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f5ff',
    padding: 24,
    flexGrow: 1,
  },
  progressBarBackground: {
    height: 4,
    backgroundColor: '#ddd',
    borderRadius: 2,
    marginBottom: 6,
  },
  progressBarFill: {
    width: '40%',
    height: 4,
    backgroundColor: '#4B0082',
    borderRadius: 2,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    marginBottom: 20,
    color: '#666',
  },
  heading: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e2e2e',
    fontFamily: 'serif',
    marginBottom: 6,
  },
  subtext: {
    fontSize: 13,
    color: '#555',
    marginBottom: 20,
  },
  toggleText: {
    color: '#4B0082',
    fontSize: 13,
    marginTop: 0,
    marginBottom: 20,
    textAlign: 'right',
  },
  relativeContainer: {
    position: 'relative',
    marginBottom: 0,
  },
  insideSearchButton: {
    position: 'absolute',
    right: 0,
    top: 26,
    backgroundColor: '#4B0082',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
