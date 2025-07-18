import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {useForm, Controller} from 'react-hook-form';
import {useNavigation} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import PageLoader from '../Components/PageLoader';

import useMedicalQuestionsStore from '../store/medicalQuestionStore';
import useMedicalInfoStore from '../store/medicalInfoStore';
import AnimatedLogoLoader from '../Components/AnimatedLogoLoader';

export default function MedicalQuestions() {
  const navigation = useNavigation();
  const [showLoader, setShowLoader] = useState(false);
  const {medicalQuestions} = useMedicalQuestionsStore();
  const {medicalInfo, setMedicalInfo} = useMedicalInfoStore();
  const [questions, setQuestions] = useState([]);

  const {control, handleSubmit, setValue, watch} = useForm({mode: 'onChange'});

  useEffect(() => {
    if (medicalInfo && medicalInfo.length) {
      setQuestions(medicalInfo);
    } else if (medicalQuestions && medicalQuestions.length) {
      const initialized = medicalQuestions.map(q => ({
        ...q,
        subfield_response: '',
      }));
      setQuestions(initialized);
    }
  }, [medicalQuestions, medicalInfo]);

  useEffect(() => {
    questions.forEach(q => {
      if (q.answer) setValue(`responses[${q.id}].answer`, q.answer);
      if (q.subfield_response) {
        setValue(`responses[${q.id}].subfield_response`, q.subfield_response);
      }
    });
  }, [questions]);

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
      <ScrollView contentContainerStyle={styles.container}>
        {questions.map(q => {
          const selectedAnswer = watch(`responses[${q.id}].answer`);
          const subfieldValue = watch(`responses[${q.id}].subfield_response`);
          const showValidationError =
            selectedAnswer === 'yes' &&
            !q.has_sub_field &&
            q.validation_error_msg;

          return (
            <View
              key={q.id}
              style={[
                styles.card,
                showValidationError ? styles.cardError : styles.cardNormal,
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
                      style={[
                        styles.option,
                        isSelected && styles.selectedOption,
                      ]}
                      onPress={() => handleAnswerChange(q.id, option)}>
                      <View
                        style={[
                          styles.radioCircle,
                          isSelected && styles.radioChecked,
                        ]}>
                        {isSelected && (
                          <Ionicons name="checkmark" size={14} color="#fff" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.optionText,
                          isSelected && styles.selectedOptionText,
                        ]}>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {showValidationError && (
                <Text style={styles.errorText}>{q.validation_error_msg}</Text>
              )}

              {q.has_sub_field && selectedAnswer === 'yes' && (
                <TextInput
                  placeholder={q.sub_field_prompt}
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

        <NextButton
          disabled={!isNextEnabled}
          onPress={handleSubmit(onSubmit)}
        />
        <BackButton
          label="Back"
          onPress={() => navigation.navigate('bmi-detail')}
        />

        {showLoader && (
          <View style={styles.loaderOverlay}>
            <AnimatedLogoLoader />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f8f5ff',
    paddingBottom: 80,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    backgroundColor: '#fff',
    borderWidth: 1,
  },
  cardNormal: {
    borderColor: '#ddd',
  },
  cardError: {
    borderColor: '#f87171',
  },
  questionText: {
    fontSize: 14,
    color: '#1C1C29',
    marginBottom: 10,
    fontWeight: '400',
    lineHeight: 20,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 10,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '48%',
  },
  selectedOption: {
    backgroundColor: '#F2EEFF',
    borderColor: '#6D28D9',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#999',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioChecked: {
    backgroundColor: '#6D28D9',
    borderColor: '#6D28D9',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: '#6D28D9',
    fontWeight: '600',
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginTop: 10,
    color: '#000',
    textAlignVertical: 'top',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 12,
    marginTop: 6,
  },
  loaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
});
