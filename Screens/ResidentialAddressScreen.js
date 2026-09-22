import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {StyleSheet, Text, View} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import {useForm, Controller} from 'react-hook-form';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

import usePatientInfoStore from '../store/patientInfoStore';
import SelectFields from '../Components/SelectFields';
import TextFields from '../Components/TextFields';
import Toast from 'react-native-toast-message';
import PostcodeSearchInput from '../Components/PostcodeSearchInput';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 40;

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
  const insets = useSafeAreaInsets();
  const {patientInfo, setPatientInfo} = usePatientInfoStore();

  const [addressOptions, setAddressOptions] = useState([]);
  const [searching, setSearching] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: {errors},
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
    }
  }, [patientInfo]);

  const onSubmit = data => {
    const fullAddress = {
      postalcode: data.postcode,
      addressone: data.address1,
      addresstwo: data.address2,
      city: data.city,
      state: '',
      country: data.country,
    };

    setPatientInfo({...patientInfo, address: fullAddress});
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
    } catch (err) {
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
      <KeyboardAwareScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        enableOnAndroid
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${PERCENTAGE}%`}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>{PERCENTAGE}% COMPLETED</Text>
            <Text style={styles.heading}>Mention Your Residential Address</Text>
            <Text style={styles.description}>
              Required for age verification purpose
            </Text>
          </View>

          <View style={styles.cardBody}>
            <Controller
              name="postcode"
              control={control}
              rules={{required: 'Postcode is required'}}
              render={({field}) => (
                <PostcodeSearchInput
                  label="Post code"
                  required
                  value={field.value}
                  onChangeText={text => {
                    field.onChange(text);
                    setAddressOptions([]);
                  }}
                  handleSearch={handleSearch}
                  addressSearchLoading={searching}
                  errors={errors?.postcode?.message}
                />
              )}
            />

            {addressOptions.length > 0 && (
              <Controller
                control={control}
                name="selectedAddress"
                render={({field: {onChange, value}}) => (
                  <SelectFields
                    label="Select Your Address"
                    value={value}
                    onChange={idx => {
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
                  />
                )}
              />
            )}

            <Controller
              control={control}
              name="address1"
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Address"
                  placeholder="e.g. 10 Downing Street"
                  required
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="address2"
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Address 2"
                  placeholder="Apartment, suite or unit (optional)"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Town / City"
                  placeholder="e.g. London"
                  required
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="country"
              render={({field: {onChange, value}}) => (
                <TextFields
                  label="Country"
                  placeholder="e.g. United Kingdom"
                  required
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                disabled={!isNextEnabled}
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
              />
              <BackButton
                label="Back"
                onPress={() => navigation.navigate('personal-details')}
              />
            </View>
          </View>
        </View>
      </KeyboardAwareScrollView>

      <Toast />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FBFBFD',
  },
  container: {
    padding: 16,
    flexGrow: 1,
  },

  // Progress bar
  progressTrack: {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: PRIMARY,
  },

  // Card
  card: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
    shadowColor: 'rgba(71, 49, 124, 0.15)',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 3,
  },
  cardHeader: {
    backgroundColor: '#f5f2fc',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(71, 49, 124, 0.08)',
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
  },
  progressLabel: {
    fontSize: 10.5,
    fontFamily: Fonts.medium,
    color: 'rgba(71, 49, 124, 0.7)',
    letterSpacing: 1.4,
    marginBottom: 8,
  },
  heading: {
    fontSize: 21,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    marginBottom: 6,
  },
  description: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 18,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 24,
  },

  buttonWrap: {
    marginTop: 6,
    marginBottom: 24,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 48,
  },
});
