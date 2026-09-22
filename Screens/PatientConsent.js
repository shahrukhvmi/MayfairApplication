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
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Fonts} from '../utils/fonts';

export default function PatientConsent() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
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
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[styles.container, {paddingBottom: insets.bottom + 24}]}
        showsVerticalScrollIndicator={false}>
        {/* Progress bar */}
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, {width: '85%'}]} />
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.progressLabel}>85% COMPLETED</Text>
            <Text style={styles.heading}>Patient Consent</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.sectionTitle}>I confirm and understand that:</Text>

            {questions.map(q => {
              const selectedAnswer = watch(`responses[${q.id}].answer`);
              const items = q.checklist
                ? extractListItemsWithLinks(q.checklist)
                : [];

              return (
                <View key={q.id} style={styles.questionBlock}>
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
                    activeOpacity={0.8}
                    style={styles.checkboxRow}>
                    <View
                      style={[
                        styles.checkbox,
                        selectedAnswer && styles.checkboxActive,
                      ]}>
                      {selectedAnswer && (
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      )}
                    </View>
                    <Text
                      style={[
                        styles.checkboxLabel,
                        selectedAnswer && styles.checkboxLabelActive,
                      ]}>
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
              <View style={styles.warningBox}>
                <Text style={styles.warningText}>
                  You must confirm before proceeding.
                </Text>
              </View>
            )}

            <View style={styles.buttonWrap}>
              <NextButton
                label="Next"
                onPress={handleSubmit(onSubmit)}
                disabled={!isNextEnabled}
                style={styles.submitButton}
              />
              <BackButton
                label="Back"
                onPress={() => navigation.navigate('medical-questions')}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const PRIMARY = '#47317c';

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

  sectionTitle: {
    fontSize: 15.5,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    paddingBottom: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },

  questionBlock: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },

  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    marginTop: 1,
  },
  checkboxActive: {
    borderColor: PRIMARY,
    backgroundColor: PRIMARY,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 13.5,
    color: '#1e293b',
    lineHeight: 20,
    fontFamily: Fonts.medium,
  },
  checkboxLabelActive: {
    color: PRIMARY,
  },

  warningBox: {
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#fbbf24',
    paddingLeft: 12,
    paddingVertical: 4,
  },
  warningText: {
    fontSize: 12.5,
    fontFamily: Fonts.regular,
    color: '#b45309',
    lineHeight: 18,
  },

  bulletList: {
    marginBottom: 12,
    paddingLeft: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bulletIcon: {
    fontSize: 15,
    color: PRIMARY,
    marginRight: 8,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 19,
  },
  linkText: {
    textDecorationLine: 'underline',
    color: PRIMARY,
    fontFamily: Fonts.medium,
  },

  buttonWrap: {
    marginTop: 20,
  },
  submitButton: {
    borderRadius: 12,
    minHeight: 48,
  },
});
