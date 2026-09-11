import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import usePatientInfoStore from '../store/patientInfoStore';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 60;
const OPTIONS = ['Yes', 'No', 'Prefer not to say'];
const ETHNICITIES = [
  'South Asian',
  'Chinese',
  'Other Asian',
  'Middle Eastern',
  'Black African',
  'African-Caribbean',
];

export default function Ethnicity() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {patientInfo, setPatientInfo} = usePatientInfoStore();

  const {
    control,
    handleSubmit,
    setValue,
    trigger,
    formState: {isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {ethnicity: ''},
  });

  useEffect(() => {
    if (patientInfo?.ethnicity) {
      const fixed =
        patientInfo.ethnicity.charAt(0).toUpperCase() +
        patientInfo.ethnicity.slice(1).toLowerCase();
      setValue('ethnicity', fixed);
      trigger(['ethnicity']);
    }
  }, [patientInfo]);

  const onSubmit = data => {
    setPatientInfo({...patientInfo, ethnicity: data.ethnicity});
    navigation.navigate('calculate-bmi');
  };

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

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>{PERCENTAGE}% COMPLETED</Text>
            <Text style={styles.heading}>Confirm Ethnicity</Text>
            <Text style={styles.headerDesc}>
              People of certain ethnicities may be suitable for treatment at a
              lower BMI than others, if appropriate.
            </Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.question}>
              Does one of the following options describe your ethnic group or
              background?
            </Text>

            {/* Ethnicity list box */}
            <View style={styles.ethnicityBox}>
              {ETHNICITIES.map(item => (
                <View key={item} style={styles.ethnicityRow}>
                  <View style={styles.ethnicityDot} />
                  <Text style={styles.ethnicityText}>{item}</Text>
                </View>
              ))}
            </View>

            {/* Options */}
            <Controller
              control={control}
              name="ethnicity"
              rules={{required: true}}
              render={({field: {value, onChange}}) => (
                <View style={styles.optionsGrid}>
                  {OPTIONS.map((opt, idx) => {
                    const isSelected = value === opt;
                    return (
                      <TouchableOpacity
                        key={opt}
                        activeOpacity={0.8}
                        onPress={() => onChange(opt)}
                        style={[
                          styles.optionPill,
                          idx === 2 && styles.optionFull,
                          isSelected && styles.optionPillActive,
                        ]}>
                        <View
                          style={[
                            styles.radioCircle,
                            isSelected && styles.radioCircleActive,
                          ]}>
                          {isSelected && <View style={styles.radioDot} />}
                        </View>
                        <Text
                          style={[
                            styles.optionText,
                            isSelected && styles.optionTextActive,
                          ]}>
                          {opt}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}
            />

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid}
                style={styles.nextButton}
              />
              <BackButton label="Back" onPress={() => navigation.goBack()} />
            </View>
          </View>
        </View>
      </ScrollView>
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
  headerDesc: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    marginTop: 8,
    lineHeight: 18,
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  question: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 16,
  },
  ethnicityBox: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    backgroundColor: 'rgba(71, 49, 124, 0.035)',
    borderRadius: 14,
    padding: 16,
    marginBottom: 22,
  },
  ethnicityRow: {
    width: '50%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
  },
  ethnicityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(71, 49, 124, 0.8)',
  },
  ethnicityText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  optionPill: {
    flexGrow: 1,
    flexBasis: '46%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 56,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
  },
  optionFull: {
    flexBasis: '100%',
  },
  optionPillActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.08)',
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
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
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionText: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  optionTextActive: {
    color: PRIMARY,
  },
  buttonWrap: {
    marginTop: 24,
  },
  nextButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
