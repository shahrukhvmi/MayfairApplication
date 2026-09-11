import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ScrollView} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import axios from 'axios';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import useGpDetailsStore from '../store/gpDetailStore';
import Header from '../Layout/header';
import {Fonts} from '../utils/fonts';
import {logApiError, logApiSuccess} from '../utils/logApiDebug';
import TextFields from '../Components/TextFields';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Toast from 'react-native-toast-message';
import SelectFields from '../Components/SelectFields';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import PostcodeSearchInput from '../Components/PostcodeSearchInput';

const PRIMARY = '#47317c';
const PERCENTAGE = 90;

const RadioPill = ({selected, label, onPress, style}) => (
  <TouchableOpacity
    activeOpacity={0.8}
    onPress={onPress}
    style={[styles.optionPill, selected && styles.optionPillActive, style]}>
    <View style={[styles.radioCircle, selected && styles.radioCircleActive]}>
      {selected && <View style={styles.radioDot} />}
    </View>
    <Text style={[styles.optionLabel, selected && styles.optionLabelActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

export default function GpDetail() {
  const insets = useSafeAreaInsets();
  const [searchLoading, setSearchLoading] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [selectedIndex, setSelectedIndex] = useState('');

  const {gpdetails, setGpDetails} = useGpDetailsStore();
  const navigation = useNavigation();

  const {
    handleSubmit,
    watch,
    setValue,
    trigger,
    control,
    formState: {errors},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      gpDetails: '',
      gepTreatMent: '',
      email: '',
      postalCode: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      gpName: '',
    },
  });

  const gpDetails = watch('gpDetails');
  const gepTreatMent = watch('gepTreatMent');
  const postalCode = watch('postalCode');

  const gpName = watch('gpName');
  const addressLine1 = watch('addressLine1');
  const city = watch('city');

  useFocusEffect(
    React.useCallback(() => {
      if (gpdetails) {
        setValue('gpDetails', gpdetails.gpConsent || '');
        setValue('gepTreatMent', gpdetails.consentDetail || '');
        setValue('email', gpdetails.email || '');
        setValue('postalCode', gpdetails.zipcode || '');
        setValue('addressLine1', gpdetails.addressLine1 || '');
        setValue('addressLine2', gpdetails.addressLine2 || '');
        setValue('city', gpdetails.city || '');
        setValue('gpName', gpdetails.gpName || '');
      }
      trigger();
    }, [gpdetails, trigger, setValue]),
  );

  const handleAddressFetch = async () => {
    if (!postalCode) return;

    const apiKey = '7a46f2abc01b47b58e586ec1cda38c68';
    const apiUrl = `https://api.nhs.uk/service-search/search-postcode-or-place?api-version=1&search=${postalCode}`;

    setSearchLoading(true);
    try {
      const response = await axios.post(
        apiUrl,
        {
          filter:
            "(OrganisationTypeID eq 'GPB') or (OrganisationTypeID eq 'GPP')",
          top: 25,
          skip: 0,
          count: true,
        },
        {
          headers: {
            'subscription-key': apiKey,
            'Content-Type': 'application/json',
          },
        },
      );
      logApiSuccess(response);
      if (response.status === 200 && response.data?.value) {
        setAddressOptions(response.data.value);
      }
    } catch (err) {
      logApiError(err);
      let message = 'Something went wrong';

      if (err.response?.status === 404) {
        Toast.show({
          type: 'error',
          text1: 'Postal Code Error',
          text2: message,
        });
      } else if (err.message) {
        message = err.message;
      }

      setAddressOptions([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const onSubmit = async data => {
    const payload = {
      gpConsent: data.gpDetails,
      consentDetail: data.gepTreatMent,
      email: data.email || '',
      zipcode: data.postalCode || '',
      gpName: data.gpName || '',
      addressLine1: data.addressLine1 || '',
      addressLine2: data.addressLine2 || '',
      city: data.city || '',
      state: '',
    };
    setGpDetails(payload);
    navigation.navigate('confirmation-summary');
  };

  const clearAddressOnlyFields = () => {
    setValue('email', '');
    setValue('postalCode', '');
    setValue('gpName', '');
    setValue('addressLine1', '');
    setValue('addressLine2', '');
    setValue('city', '');

    setAddressOptions([]);
    setSelectedIndex('');
  };

  const isNextValid = (() => {
    if (gpDetails === 'no') return true;
    if (gpDetails === 'yes' && gepTreatMent === 'no') return true;
    if (gpDetails === 'yes' && gepTreatMent === 'yes') {
      return !!gpName?.trim() && !!addressLine1?.trim() && !!city?.trim();
    }
    return false;
  })();

  return (
    <>
      <Header />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.container,
          {paddingBottom: insets.bottom + 24},
        ]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: `${PERCENTAGE}%`}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>{PERCENTAGE}% COMPLETED</Text>
            <Text style={styles.heading}>GP Details</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.questionText}>
              Are you registered with a GP in the UK?
            </Text>
            <View style={styles.optionRow}>
              {['yes', 'no'].map(option => (
                <RadioPill
                  key={option}
                  selected={gpDetails === option}
                  label={option === 'yes' ? 'Yes' : 'No'}
                  onPress={() => setValue('gpDetails', option)}
                  style={{flex: 1}}
                />
              ))}
            </View>

            {gpDetails === 'no' && (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  You should inform your doctor of any medication you take.
                  Contact us if you want us to email a letter for your doctor.
                </Text>
              </View>
            )}

            {gpDetails === 'yes' && (
              <>
                <Text style={styles.helperText}>
                  If you are registered with a GP in the UK then we can inform
                  them on your behalf.
                </Text>
                <Text style={styles.questionText}>
                  Do you consent for us to inform your GP about the treatment?
                </Text>
                <View style={styles.optionColumn}>
                  {[
                    {value: 'yes', label: 'Yes – Please inform my GP'},
                    {
                      value: 'no',
                      label:
                        'No – I will inform my GP prior to starting treatment',
                    },
                  ].map(opt => (
                    <RadioPill
                      key={opt.value}
                      selected={gepTreatMent === opt.value}
                      label={opt.label}
                      onPress={() => {
                        setValue('gepTreatMent', opt.value);
                        if (opt.value === 'no') clearAddressOnlyFields();
                      }}
                    />
                  ))}
                </View>
              </>
            )}

            {gpDetails === 'yes' && gepTreatMent === 'yes' && (
              <>
                <TextFields
                  label="GP Email"
                  value={watch('email')}
                  onChangeText={text => setValue('email', text)}
                />

                <Controller
                  name="postalCode"
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
                        setSelectedIndex('');
                      }}
                      handleSearch={handleAddressFetch}
                      addressSearchLoading={searchLoading}
                      errors={errors?.postalCode?.message}
                    />
                  )}
                />

                {addressOptions?.length > 0 && (
                  <SelectFields
                    label="Select Your Address"
                    value={selectedIndex}
                    onChange={idx => {
                      const selected = addressOptions[idx];
                      setSelectedIndex(idx);
                      setValue('gpName', selected.OrganisationName || '', {
                        shouldValidate: true,
                      });
                      setValue('addressLine1', selected.Address1 || '', {
                        shouldValidate: true,
                      });
                      setValue('addressLine2', selected.Address2 || '', {
                        shouldValidate: true,
                      });
                      setValue('city', selected.City || '', {
                        shouldValidate: true,
                      });
                    }}
                    options={addressOptions.map((addr, idx) => ({
                      value: idx,
                      label: `${addr.OrganisationName}, ${addr.Address1}, ${addr.City}`,
                    }))}
                    required
                  />
                )}

                <TextFields
                  required
                  label="GP Name"
                  placeholder="Enter your GP name"
                  value={watch('gpName')}
                  onChangeText={text => setValue('gpName', text)}
                />
                <TextFields
                  required
                  label="Address"
                  placeholder="e.g. 10 High Street"
                  value={watch('addressLine1')}
                  onChangeText={text => setValue('addressLine1', text)}
                />
                <TextFields
                  label="Address 2"
                  placeholder="Building, suite or unit (optional)"
                  value={watch('addressLine2')}
                  onChangeText={text => setValue('addressLine2', text)}
                />
                <TextFields
                  required
                  label="Town / City"
                  placeholder="e.g. London"
                  value={watch('city')}
                  onChangeText={text => setValue('city', text)}
                />
              </>
            )}

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                onPress={handleSubmit(onSubmit)}
                disabled={!isNextValid}
                style={styles.submitButton}
              />
              <BackButton
                label="Back"
                onPress={() => navigation.navigate('patient-consent')}
              />
            </View>
          </View>
        </View>
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
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  questionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#334155',
    marginBottom: 12,
    marginTop: 6,
  },
  helperText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 18,
  },

  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  optionColumn: {
    gap: 10,
    marginBottom: 8,
  },
  optionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  optionPillActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.05)',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  radioDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fff',
  },
  optionLabel: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  optionLabelActive: {
    color: PRIMARY,
  },

  infoBox: {
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.4)',
    backgroundColor: 'rgba(255, 251, 235, 0.6)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginTop: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#92400e',
    lineHeight: 18,
  },

  buttonWrap: {
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
