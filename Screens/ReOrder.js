import React, {useState} from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import useReorder from '../store/useReorderStore';
import useReorderBackProcessStore from '../store/useReorderBackProcess';
import useReorderButtonStore from '../store/useReorderButton';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import PageLoader from '../Components/PageLoader';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 0;

export default function ReOrder() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {setReorderStatus} = useReorder();
  const {setIsFromReorder} = useReorderButtonStore();
  const {setReorderBackProcess} = useReorderBackProcessStore();

  const [showLoader, setShowLoader] = useState(false);

  const {
    control,
    handleSubmit,
    formState: {isValid},
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      personalUse: '',
    },
  });

  useFocusEffect(
    React.useCallback(() => {
      setReorderBackProcess(false);
    }, []),
  );

  const onSubmit = async data => {
    setIsFromReorder(false);
    setShowLoader(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.personalUse === 'yes') {
      navigation.navigate('signup');
      setReorderStatus(true);
    } else {
      navigation.navigate('calculate-bmi');
      setReorderStatus(false);
      setReorderBackProcess(true);
    }
  };

  const renderYesNo = (value, onChange) => (
    <View style={styles.optionRow}>
      {['yes', 'no'].map(option => {
        const isSelected = value === option;
        const isYes = option === 'yes';
        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.8}
            onPress={() => onChange(option)}
            style={[
              styles.optionPill,
              isSelected &&
                (isYes
                  ? styles.optionPillYesActive
                  : styles.optionPillNoActive),
            ]}>
            <View
              style={[
                styles.radioCircle,
                isSelected &&
                  (isYes
                    ? styles.radioCircleYesActive
                    : styles.radioCircleNoActive),
              ]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.optionLabel,
                isSelected &&
                  (isYes ? styles.optionLabelYes : styles.optionLabelNo),
              ]}>
              {isYes ? 'Yes' : 'No'}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

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
            <Text style={styles.heading}>Reorder Confirmation</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.questionText}>
              Has anything changed since your last order?
            </Text>

            <Controller
              control={control}
              name="personalUse"
              rules={{required: true}}
              render={({field: {value, onChange}}) =>
                renderYesNo(value, onChange)
              }
            />

            <View style={styles.buttonWrap}>
              <NextButton
                label="I Confirm"
                disabled={!isValid}
                onPress={handleSubmit(onSubmit)}
                style={styles.submitButton}
              />
            </View>
          </View>

          {showLoader && (
            <View style={styles.loaderOverlay}>
              <PageLoader />
            </View>
          )}
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
    paddingTop: 22,
    paddingBottom: 24,
  },
  questionText: {
    fontSize: 14.5,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    lineHeight: 21,
  },

  // Options
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  optionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 14,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  optionPillYesActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.05)',
  },
  optionPillNoActive: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
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
  radioCircleYesActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  radioCircleNoActive: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontSize: 14,
    fontFamily: Fonts.medium,
    color: '#334155',
    textTransform: 'capitalize',
  },
  optionLabelYes: {
    color: PRIMARY,
  },
  optionLabelNo: {
    color: '#047857',
  },

  // Button
  buttonWrap: {
    marginTop: 28,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },

  // Loader
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
