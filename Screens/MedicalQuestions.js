import React, {useState} from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';
const PERCENTAGE = 80;

export default function MedicalQuestions() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {medicalQuestions} = useMedicalQuestionsStore();
  const {medicalInfo, setMedicalInfo} = useMedicalInfoStore();
  const [questions, setQuestions] = useState([]);

  const {handleSubmit, setValue, watch} = useForm({mode: 'onChange'});

  useFocusEffect(
    React.useCallback(() => {
      if (medicalInfo && medicalInfo.length) {
        setQuestions(medicalInfo);
      } else if (medicalQuestions && medicalQuestions.length) {
        const initialized = medicalQuestions.map(q => ({
          ...q,
          subfield_response: '',
        }));
        setQuestions(initialized);
      }
    }, [medicalQuestions, medicalInfo]),
  );

  useFocusEffect(
    React.useCallback(() => {
      questions.forEach(q => {
        if (q.answer) setValue(`responses[${q.id}].answer`, q.answer);
        if (q.subfield_response) {
          setValue(`responses[${q.id}].subfield_response`, q.subfield_response);
        }
      });
    }, [questions]),
  );

  const handleAnswerChange = (id, value) => {
    const updated = questions.map(q =>
      q.id === id
        ? {
            ...q,
            answer: value,
            subfield_response: value === 'no' ? '' : q.subfield_response,
          }
        : q,
    );
    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
    if (value === 'no') {
      setValue(`responses[${id}].subfield_response`, '');
    }
  };

  const handleSubFieldChange = (id, value) => {
    const updated = questions.map(q =>
      q.id === id ? {...q, subfield_response: value} : q,
    );
    setQuestions(updated);
    setValue(`responses[${id}].subfield_response`, value);
  };

  const isNextEnabled = questions.every(q => {
    const answer = watch(`responses[${q.id}].answer`);
    const subfield = watch(`responses[${q.id}].subfield_response`);
    if (answer === 'no') return true;
    if (answer === 'yes' && q.has_sub_field)
      return subfield && subfield.trim() !== '';
    if (answer === 'yes' && !q.has_sub_field && q.validation_error_msg)
      return false;
    return false;
  });

  const onSubmit = async () => {
    setMedicalInfo(questions);
    navigation.navigate('patient-consent');
  };

  return (
    <>
      <Header />
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={[
            styles.container,
            {paddingBottom: Math.max(insets.bottom, 24) + 40},
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
              <Text style={styles.heading}>Medical Questions</Text>
            </View>

            <View style={styles.cardBody}>
              {questions.map(q => {
                const selectedAnswer = watch(`responses[${q.id}].answer`);
                const subfieldValue = watch(
                  `responses[${q.id}].subfield_response`,
                );
                const showValidationError =
                  selectedAnswer === 'yes' &&
                  !q.has_sub_field &&
                  q.validation_error_msg;

                return (
                  <View
                    key={q.id}
                    style={[
                      styles.questionCard,
                      showValidationError && styles.questionCardError,
                    ]}>
                    <Text style={styles.questionText}>
                      {q.question.replace(/<[^>]*>/g, '')}
                    </Text>

                    <View style={styles.optionsRow}>
                      {q.options.map(option => {
                        const isSelected = selectedAnswer === option;
                        return (
                          <TouchableOpacity
                            key={option}
                            activeOpacity={0.8}
                            style={[
                              styles.optionPill,
                              isSelected && styles.optionPillActive,
                            ]}
                            onPress={() => handleAnswerChange(q.id, option)}>
                            <View
                              style={[
                                styles.radioCircle,
                                isSelected && styles.radioCircleActive,
                              ]}>
                              {isSelected && <View style={styles.radioDot} />}
                            </View>
                            <Text
                              style={[
                                styles.optionLabel,
                                isSelected && styles.optionLabelActive,
                              ]}>
                              {option.charAt(0).toUpperCase() + option.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>

                    {showValidationError && (
                      <View style={styles.errorBox}>
                        <Text style={styles.errorBoxText}>
                          {q.validation_error_msg}
                        </Text>
                      </View>
                    )}

                    {q.has_sub_field && selectedAnswer === 'yes' && (
                      <TextInput
                        placeholder={q.sub_field_prompt}
                        placeholderTextColor="#94a3b8"
                        value={subfieldValue}
                        onChangeText={text => handleSubFieldChange(q.id, text)}
                        style={styles.textArea}
                        multiline
                        numberOfLines={4}
                      />
                    )}
                  </View>
                );
              })}

              <View style={styles.buttonWrap}>
                <NextButton
                  disabled={!isNextEnabled}
                  onPress={handleSubmit(onSubmit)}
                  label="Next"
                  style={styles.submitButton}
                />
                <BackButton
                  label="Back"
                  onPress={() => navigation.navigate('bmi')}
                  style={styles.backButton}
                />
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  },
  cardBody: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },

  // Question card
  questionCard: {
    borderWidth: 1,
    borderColor: '#f1f5f9',
    backgroundColor: '#FBFBFD',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  questionCardError: {
    borderColor: '#fecaca',
    backgroundColor: 'rgba(254, 242, 242, 0.3)',
  },
  questionText: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 14,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  optionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  optionPillActive: {
    borderColor: PRIMARY,
    backgroundColor: 'rgba(71, 49, 124, 0.05)',
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
  },
  optionLabel: {
    fontSize: 13,
    fontFamily: Fonts.medium,
    color: '#334155',
  },
  optionLabelActive: {
    color: PRIMARY,
  },

  errorBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorBoxText: {
    fontSize: 11.5,
    fontFamily: Fonts.regular,
    color: '#dc2626',
  },

  textArea: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.15)',
    borderRadius: 12,
    padding: 14,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#0f172a',
    marginTop: 14,
    minHeight: 90,
    textAlignVertical: 'top',
    backgroundColor: '#fff',
  },

  buttonWrap: {
    marginTop: 6,
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 8,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 48,
  },
});
