import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {Controller, useForm} from 'react-hook-form';
import axios from 'axios';
import {useNavigation} from '@react-navigation/native';
import useGpDetailsStore from '../store/gpDetailStore';
import Header from '../Layout/header';
import SelectField from '../Components/SelectField';
import {logApiError, logApiSuccess} from '../utils/logApiDebug';
import TextFields from '../Components/TextFields';
import Icon from 'react-native-vector-icons/FontAwesome';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import Toast from 'react-native-toast-message';
import SelectFields from '../Components/SelectFields';
import {SafeAreaView} from 'react-native-safe-area-context';
import PostcodeSearchInput from '../Components/PostcodeSearchInput';
export default function GpDetail() {
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
    formState: {errors, isValid},
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

  useEffect(() => {
    if (gpdetails) {
      setValue('gpDetails', gpdetails.gpConsent || '');
      setValue('gepTreatMent', gpdetails.consentDetail || '');
      setValue('email', gpdetails.email || '');
      setValue('postalCode', gpdetails.zipcode || '');
      setValue('addressLine1', gpdetails.addressLine1 || '');
      setValue('addressLine2', gpdetails.addressLine2 || '');
      setValue('city', gpdetails.city || '');
      setValue('gpName', gpdetails.gpName || '');

      // if (gpdetails.zipcode || gpdetails.addressLine1 || gpdetails.city) {
      //     setManual(true);
      // }
    }
    trigger();
  }, [gpdetails, trigger, setValue]);

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
      console.error('Postal search failed', err);

      let message = 'Something went wrong';

      if (err.response?.status === 404) {
        // Custom error from NHS API
        const errorData = err.response?.data;
        message =
          errorData?.errorName ||
          errorData?.errorText ||
          'Invalid postal code. Please try again.';
      } else if (err.message) {
        message = err.message;
      }

      Toast.show({
        type: 'error',
        text1: 'Postal Code Error',
        text2: message,
      });

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
  const clearAllGpFields = () => {
    setValue('gepTreatMent', '');
    setValue('email', '');
    setValue('postalCode', '');
    setValue('gpName', '');
    setValue('addressLine1', '');
    setValue('addressLine2', '');
    setValue('city', '');

    setAddressOptions([]);
    setSelectedIndex('');
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
      <SafeAreaView style={styles.container}>
        <Header />
        <ScrollView
          contentContainerStyle={styles.formWrapper}
          showsVerticalScrollIndicator={false}>
          <Text style={styles.heading}>GP Details</Text>
          <Text style={styles.subheading}>
            Are you registered with a GP in the UK?
          </Text>
          <View style={styles.checkboxGroup}>
            {['yes', 'no'].map(option => {
              const isSelected = gpDetails === option;

              return (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.checkboxOption,
                    isSelected && styles.checkboxSelected,
                  ]}
                  onPress={() => setValue('gpDetails', option)}>
                  <View
                    style={[
                      styles.checkboxIconWrapper,
                      isSelected && styles.checkboxIconSelected,
                    ]}>
                    {isSelected && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {option === 'yes' ? 'Yes' : 'No'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {gpDetails === 'no' && (
            <View style={styles.infoBox}>
              <Text>
                You should inform your doctor of any medication you take.
                Contact us if you want us to email a letter for your doctor.
              </Text>
            </View>
          )}

          {gpDetails === 'yes' && (
            <>
              <Text style={styles.subheading}>
                Do you consent for us to inform your GP about the treatment?
              </Text>
              <View style={styles.checkboxGroupColumn}>
                {[
                  {value: 'yes', label: 'Yes – Please inform my GP'},
                  {
                    value: 'no',
                    label: `No – I will inform my GP prior to starting \ntreatment`,
                  },
                ].map(opt => {
                  const isSelected = gepTreatMent === opt.value;

                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[
                        styles.checkboxOptionRow,
                        isSelected && styles.checkboxSelected,
                      ]}
                      onPress={() => {
                        setValue('gepTreatMent', opt.value);
                        if (opt.value === 'no') clearAddressOnlyFields();
                      }}>
                      <View
                        style={[
                          styles.checkboxIconWrapper,
                          isSelected && styles.checkboxIconSelected,
                        ]}>
                        {isSelected && (
                          <Icon name="check" size={14} color="#fff" />
                        )}
                      </View>
                      <Text style={styles.checkboxLabel}>{opt.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          )}

          {gpDetails === 'yes' && gepTreatMent === 'yes' && (
            <>
              <Text style={styles.optionalText}>
                Email <Text style={styles.optionalNote}>(optional)</Text>
              </Text>
              <TextFields
                // label={"Email"}
                placeholder="Email"
                value={watch('email')}
                onChangeText={text => setValue('email', text)}
              />

              <View style={{marginBottom: 16}}>
                <View style={{marginBottom: 16}}>
                  <Controller
                    name="postalCode"
                    control={control}
                    rules={{required: 'Postcode is required'}}
                    render={({field}) => (
                      <PostcodeSearchInput
                        label="Post code"
                        value={field.value}
                        onChangeText={text => {
                          field.onChange(text);
                          setAddressOptions([]); // ← carry over your logic
                          setSelectedIndex(''); // ← carry over your logic
                        }}
                        handleSearch={handleAddressFetch} // your old function
                        addressSearchLoading={searchLoading}
                        errors={errors?.postalCode?.message}
                      />
                    )}
                  />
                </View>

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
                    error={errors?.addressLine1?.message}
                  />
                )}
              </View>
            </>
          )}

          {gpDetails === 'yes' && gepTreatMent === 'yes' && (
            <>
              <TextFields
                required
                placeholder="GP Name"
                label="GP Name"
                value={watch('gpName')}
                onChangeText={text => setValue('gpName', text)}
              />
              <TextFields
                required
                label="Address"
                placeholder="Address"
                value={watch('addressLine1')}
                onChangeText={text => setValue('addressLine1', text)}
              />
              <TextFields
                label="Address 2"
                placeholder="Address 2"
                valueTextField={watch('addressLine2')}
                onChangeText={text => setValue('addressLine2', text)}
              />
              <TextFields
                required
                label="Town / City"
                placeholder="Town / City"
                value={watch('city')}
                onChangeText={text => setValue('city', text)}
              />
            </>
          )}

          <NextButton
            style={{width: '100%'}}
            label="Next"
            onPress={handleSubmit(onSubmit)}
            disabled={!isNextValid}
          />

          <BackButton
            label="Back"
            onPress={() => navigation.navigate('patient-consent')}
          />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF8FF', // soft lavender background
  },

  formWrapper: {
    padding: 16,
    paddingBottom: 100,
  },

  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000000ff', // bold purple heading
  },

  subheading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4B3F72',
  },

  radioGroup: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },

  radioGroup2: {
    flexDirection: 'column',
    gap: 10,
    marginBottom: 16,
  },

  radioButton: {
    flex: 1,
    flexDirection: 'row',
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },

  selectedRadio: {
    backgroundColor: '#C9B2ED', // deep purple
    borderColor: '#5B2A86',
  },

  radioText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  selectedRadioText: {
    color: '#fff',
  },

  infoBox: {
    backgroundColor: '#FFF6E5', // light warm yellow
    borderLeftWidth: 4,
    borderLeftColor: '#FFBF47', // NHS standard yellow
    padding: 12,
    borderRadius: 6,
    marginVertical: 16,
  },

  optionalText: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 4,
    color: '#4B3F72',
  },

  optionalNote: {
    fontStyle: 'italic',
    color: '#888',
  },

  searchButton: {
    backgroundColor: '#5B2A86', // unified button color
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    marginTop: 28,
  },

  searchButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },

  nextButton: {
    backgroundColor: '#3A0CA3',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 20,
  },

  nextButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  footerNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#E0DFF5',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    gap: 12,
  },
  checkboxGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  checkboxOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: '#fff',
  },

  checkboxSelected: {
    backgroundColor: '#EFE6FD', // light purple background
    borderColor: '#5B2A86',
  },

  checkboxIconWrapper: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderColor: '#5B2A86',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  checkboxIconSelected: {
    backgroundColor: '#5B2A86',
    borderColor: '#5B2A86',
  },

  checkboxLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  checkboxGroupColumn: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16,
  },

  checkboxOptionRow: {
    flexDirection: 'row',
    // flexWrap:'wrap',

    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
});
