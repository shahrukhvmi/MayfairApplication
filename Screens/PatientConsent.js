import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import {useForm} from 'react-hook-form';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import useConfirmationQuestionsStore from '../store/confirmationQuestionStore';
import useConfirmationInfoStore from '../store/confirmationInfoStore';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';
import {MdCheckBox, MdCheckBoxOutlineBlank} from 'react-icons/md'; // ignore in RN
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function PatientConsent() {
  const navigation = useNavigation();
  const [showLoader, setShowLoader] = useState(false);

  const {confirmationQuestions} = useConfirmationQuestionsStore();
  const {confirmationInfo, setConfirmationInfo} = useConfirmationInfoStore();
  const [questions, setQuestions] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: {errors, isValid},
  } = useForm({
    mode: 'onChange',
  });

  useFocusEffect(
    React.useCallback(() => {
      if (confirmationInfo && confirmationInfo.length) {
        console.log('✅ Loading from confirmationInfo (user answers)');
        setQuestions(confirmationInfo);
      } else if (confirmationQuestions && confirmationQuestions.length) {
        console.log('🟡 Loading from confirmationQuestions (API fallback)');
        const initialized = confirmationQuestions.map(q => ({
          ...q,
          answer: false,
          has_check_list: true,
          has_checklist: true,
        }));
        console.log(initialized, 'initialized');
        setQuestions(initialized);
      } else {
        console.log('❌ No questions found');
      }
    }, [confirmationInfo, confirmationQuestions]),
  );

  useFocusEffect(
    React.useCallback(() => {
      questions.forEach(q => {
        setValue(`responses[${q.id}].answer`, q.answer ?? false);
      });
    }, [questions]),
  );

  const handleCheckboxChange = (id, value) => {
    const updated = questions.map(q =>
      q.id === id
        ? {...q, answer: value, has_check_list: true, has_checklist: true}
        : q,
    );

    setQuestions(updated);
    setValue(`responses[${id}].answer`, value);
  };

  const isNextEnabled = questions.every(
    q => watch(`responses[${q.id}].answer`) === true,
  );

  const onSubmit = async () => {
    setConfirmationInfo(questions);
    setShowLoader(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    navigation.navigate('gp-detail');
  };

  // ---------------------------
  // Minimal HTML <li> + <a> renderer (no libs)
  // ---------------------------
  const stripTags = s =>
    s
      .replace(/<\/?[^>]+>/g, '')
      .replace(/\s+/g, ' ')
      .trim();

  /**
   * Returns an array of list items, where each item is an array of segments:
   *   [{ type: 'text', text: string }] or [{ type: 'link', text: string, href: string }]
   */
  const extractListItemsWithLinks = html => {
    if (!html || typeof html !== 'string') return [];
    const items = [...html.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map(m => m[1]);
    return items.map(inner => {
      const parts = [];
      const linkRe = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let last = 0;
      let m;

      while ((m = linkRe.exec(inner)) !== null) {
        if (m.index > last) {
          const before = inner.slice(last, m.index);
          const text = stripTags(before);
          if (text.length) parts.push({type: 'text', text});
        }
        const href = m[1];
        const linkText = stripTags(m[2] || '');
        if (linkText.length) parts.push({type: 'link', href, text: linkText});
        last = m.index + m[0].length;
      }

      if (last < inner.length) {
        const after = stripTags(inner.slice(last));
        if (after.length) parts.push({type: 'text', text: after});
      }

      // Fallback if no segments found but inner had text
      if (parts.length === 0) {
        const onlyText = stripTags(inner);
        if (onlyText.length) parts.push({type: 'text', text: onlyText});
      }

      return parts;
    });
  };

  const confirmAndOpenLink = href => {
    if (!href) return;
    Alert.alert(
      'Leave this app?',
      'You are leaving this app to view Mayfair Terms & Conditions.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Continue',
          style: 'default',
          onPress: () => Linking.openURL(href),
        },
      ],
      {cancelable: true},
    );
  };

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>85% Completed</Text>
        <Text style={styles.heading}>Patient Consent</Text>

        <View>
          {questions.map(q => {
            const selectedAnswer = watch(`responses[${q.id}].answer`);
            const items = q.checklist
              ? extractListItemsWithLinks(q.checklist)
              : [];

            return (
              <View key={q.id} style={styles.card}>
                <Text style={styles.cardTitle}>
                  I confirm and understand that:
                </Text>

                {items.length > 0 ? (
                  <View style={styles.bulletList}>
                    {items.map((segments, idx) => (
                      <View key={`${q.id}-${idx}`} style={styles.bulletItem}>
                        <Text style={styles.bulletIcon}>{'\u2022'}</Text>
                        <Text style={styles.bulletText}>
                          {segments.map((seg, i) =>
                            seg.type === 'text' ? (
                              <Text key={i}>{seg.text} </Text>
                            ) : (
                              <Text
                                key={i}
                                style={styles.linkText}
                                onPress={() => confirmAndOpenLink(seg.href)}>
                                {seg.text}
                              </Text>
                            ),
                          )}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <TouchableOpacity
                  onPress={() => handleCheckboxChange(q.id, !selectedAnswer)}
                  style={styles.checkboxRow}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedAnswer && styles.radioChecked,
                    ]}>
                    {selectedAnswer && (
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    )}
                  </View>
                  <Text style={styles.checkboxLabel}>
                    {q.question
                      .replace('I confirm and understand that:', '')
                      .replace('below', 'above')
                      .trim()}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })}

          {!isNextEnabled && (
            <Text style={styles.errorText}>
              You must confirm before proceeding.
            </Text>
          )}

          <NextButton
            label="Next"
            onPress={handleSubmit(onSubmit)}
            disabled={!isNextEnabled}
            style={{marginTop: 20}}
          />
          <BackButton
            label="Back"
            onPress={() => navigation.navigate('medical-questions')}
          />
        </View>

        {showLoader && (
          <View style={styles.loaderOverlay}>
            <ActivityIndicator size="large" color="#4B0082" />
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f5ff',
    flexGrow: 1,
    padding: 20,
    paddingBottom: 80,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    width: '85%',
    height: 4,
    backgroundColor: '#4B0082',
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 20,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  checklistText: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
  },
  checkboxRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 13,
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircle: {
    width: 20,
    height: 20,
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
  bulletList: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  bulletIcon: {
    fontSize: 16,
    color: '#4B0082',
    marginTop: 0,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: '#1D4ED8',
  },
});
