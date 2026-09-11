import Feather from 'react-native-vector-icons/Feather';

import {useState} from 'react';
import {useNavigation} from '@react-navigation/native';

import {ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 0;

const CONSENT_ITEMS = [
  'You consent for your medical information to be assessed by the clinical team at Mayfair Weight Loss Clinic and its pharmacy and to be prescribed medication.',
  'You consent to an age and ID check when placing your first order.',
  'You will answer all questions honestly and accurately, and understand that it is an offence to provide false information.',
  'You have capacity to understand all about the condition and medication information we have provided and that you give fully informed consent to the treatment option provided.',
  'You understand that the treatment or medical advice provided is based on the information you have provided.',
];

const QUESTIONS = [
  {
    id: 'personalUse',
    text: 'Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?',
  },
  {
    id: 'decisionCapacity',
    text: 'Do you believe you have the ability to make healthcare decisions for yourself?',
  },
];

export default function AcknowledgmentScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [answers, setAnswers] = useState({personalUse: null, decisionCapacity: null});
  const [confirmChecked, setConfirmChecked] = useState(false);

  const {personalUse, decisionCapacity} = answers;
  const isNoSelected = personalUse === 'no' || decisionCapacity === 'no';
  const showConsentBox = personalUse === 'yes' && decisionCapacity === 'yes';
  const canConfirm = showConsentBox && confirmChecked;

  const setAnswer = (id, value) =>
    setAnswers(prev => ({...prev, [id]: value}));

  const renderYesNo = (fieldId, value) => (
    <View style={styles.optionRow}>
      {['yes', 'no'].map(option => {
        const isSelected = value === option;
        const isYes = option === 'yes';
        return (
          <TouchableOpacity
            key={option}
            activeOpacity={0.8}
            onPress={() => setAnswer(fieldId, option)}
            style={[
              styles.optionPill,
              isSelected &&
                (isYes ? styles.optionPillYesActive : styles.optionPillNoActive),
            ]}>
            <View
              style={[
                styles.radioCircle,
                isSelected &&
                  (isYes ? styles.radioCircleYesActive : styles.radioCircleNoActive),
              ]}>
              {isSelected && <View style={styles.radioDot} />}
            </View>
            <Text
              style={[
                styles.optionLabel,
                isSelected && (isYes ? styles.optionLabelYes : styles.optionLabelNo),
              ]}>
              {option === 'yes' ? 'Yes' : 'No'}
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
            <Text style={styles.heading}>Acknowledgment</Text>
          </View>

          <View style={styles.cardBody}>
            {QUESTIONS.map((q, idx) => (
              <View
                key={q.id}
                style={[styles.questionBlock, idx === 0 && styles.questionBlockFirst]}>
                <Text style={styles.questionText}>{q.text}</Text>
                {renderYesNo(q.id, q.id === 'personalUse' ? personalUse : decisionCapacity)}
              </View>
            ))}

            {isNoSelected && (
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  Unfortunately we are unable to proceed. Please consult a
                  healthcare professional if you have concerns.
                </Text>
              </View>
            )}

            {showConsentBox && (
              <View style={styles.consentBox}>
                <TouchableOpacity
                  style={styles.consentHeader}
                  activeOpacity={0.8}
                  onPress={() => setConfirmChecked(!confirmChecked)}>
                  <View
                    style={[
                      styles.checkbox,
                      confirmChecked && styles.checkboxActive,
                    ]}>
                    {confirmChecked && (
                      <Feather name="check" size={12} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.consentTitle}>Do you confirm that:</Text>
                </TouchableOpacity>

                <View style={styles.consentList}>
                  {CONSENT_ITEMS.map((item, idx) => (
                    <View style={styles.consentRow} key={idx}>
                      <Feather
                        name="check-circle"
                        size={13}
                        color="rgba(71, 49, 124, 0.5)"
                        style={styles.consentIcon}
                      />
                      <Text style={styles.consentText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.buttonWrap}>
              <NextButton
                label="I Confirm"
                loading={false}
                disabled={!canConfirm}
                onPress={() => navigation.navigate('signup')}
                style={styles.submitButton}
              />
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
    paddingTop: 6,
    paddingBottom: 24,
  },

  // Questions
  questionBlock: {
    paddingVertical: 22,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  questionBlockFirst: {
    borderTopWidth: 0,
    paddingTop: 18,
  },
  questionText: {
    fontSize: 14.5,
    fontFamily: Fonts.medium,
    color: '#1e293b',
    lineHeight: 21,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
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
    borderColor: '#f87171',
    backgroundColor: '#fef2f2',
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
    borderColor: '#f87171',
    backgroundColor: '#f87171',
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
  },
  optionLabelYes: {
    color: PRIMARY,
  },
  optionLabelNo: {
    color: '#dc2626',
  },

  // Warning
  warningBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 15,
  },
  warningText: {
    fontSize: 12.5,
    fontFamily: Fonts.medium,
    color: '#dc2626',
    lineHeight: 18,
  },

  // Consent box
  consentBox: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.14)',
    backgroundColor: '#faf9fd',
    borderRadius: 14,
    padding: 18,
  },
  consentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  consentTitle: {
    fontSize: 14,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
  },
  consentList: {
    marginTop: 14,
    paddingLeft: 4,
    gap: 10,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  consentIcon: {
    marginTop: 2,
  },
  consentText: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 18,
  },

  // Button
  buttonWrap: {
    marginTop: 22,
  },
  submitButton: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    minHeight: 48,
  },
});
