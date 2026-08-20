import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Linking,
} from 'react-native';
import {DotLottie} from '@lottiefiles/dotlottie-react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import TrackReview from '../api/TrackReviewApi';
import useReviewStore from '../store/useReviewStore';
import useCartStore from '../store/useCartStore';

const googleIcon = require('../assets/images/google.png');
const trustpilotIcon = require('../assets/images/trustpilot.png');

export default function ReviewScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {orderId: reviewOrderId, clearReview} = useReviewStore();
  const {orderId: cartOrderId} = useCartStore();
  const orderId = reviewOrderId || cartOrderId;

  const [mode, setMode] = useState('idle');
  const [heading, setHeading] = useState('How was your experience?');
  const [feedback, setFeedback] = useState('');
  const [reviewDisabled, setReviewDisabled] = useState(false);

  // Page view tracking — silent, UI block nahi karni
  useEffect(() => {
    if (!orderId) return;
    TrackReview({review: true, company_id: 1, order_id: orderId}).catch(
      () => {},
    );
  }, [orderId]);

  const sendReview = async ({
    review_type = null,
    review_feedback = null,
    review_source = null,
  }) => {
    try {
      await TrackReview({
        review: true,
        review_type,
        company_id: 1,
        review_feedback,
        review_source,
        order_id: orderId,
      });
    } catch (err) {
      const orderErr = err?.response?.data?.errors?.order_id;
      if (orderErr) {
        setReviewDisabled(true);
        Toast.show({
          type: 'error',
          text1: 'Order not completed',
          text2: orderErr,
        });
      }
    }
  };

  const transition = (text, next) => {
    setHeading(text);
    setMode(next);
  };

  const handleDone = () => {
    clearReview();
    navigation.navigate('dashboard');
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {paddingTop: insets.top + 24, paddingBottom: insets.bottom + 32},
      ]}>
      <View style={styles.shell}>
        {/* Logo */}
        <Image
          source={require('../assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        {reviewDisabled ? (
          <View style={styles.thanksPanel}>
            <Text style={styles.thanksText}>
              Complete your order to leave a review. We value your feedback and
              look forward to hearing about your experience once your order is
              finalised.
            </Text>
            <TouchableOpacity style={styles.backBtn} onPress={handleDone}>
              <Text style={styles.backBtnText}>Go to Dashboard</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {mode !== 'idle' && (
              <TouchableOpacity
                style={styles.topBack}
                onPress={() => transition('How was your experience?', 'idle')}>
                <Text style={styles.topBackText}>← Back</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.heading}>{heading}</Text>

            {mode === 'idle' && (
              <View style={styles.emojiRow}>
                {/* Happy */}
                <TouchableOpacity
                  style={[styles.emojiCard, styles.happyCard]}
                  onPress={() => {
                    sendReview({review_type: 'happy'}).catch(() => {});
                    transition(
                      "Had a good experience? We'd really appreciate a 5-star review.",
                      'happy',
                    );
                  }}>
                  <DotLottie
                    source={require('../assets/smiley-emoji.anim')}
                    autoplay
                    loop
                    style={styles.lottie}
                  />
                </TouchableOpacity>

                {/* Sad */}
                <TouchableOpacity
                  style={[styles.emojiCard, styles.sadCard]}
                  onPress={() => {
                    sendReview({review_type: 'sad'}).catch(() => {});
                    transition(
                      "Sorry your experience wasn't great. Your feedback helps us improve.",
                      'sad',
                    );
                  }}>
                  <DotLottie
                    source={require('../assets/sad-emoji.anim')}
                    autoplay
                    loop
                    style={styles.lottie}
                  />
                </TouchableOpacity>
              </View>
            )}

            {mode === 'idle' && (
              <Text style={styles.tapText}>Tap on an option</Text>
            )}

            {mode === 'sad' && (
              <View style={styles.sadPanel}>
                <TextInput
                  style={styles.textarea}
                  placeholder="Tell us what went wrong..."
                  placeholderTextColor="#999"
                  value={feedback}
                  onChangeText={setFeedback}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                />
                <TouchableOpacity
                  style={[
                    styles.submitBtn,
                    !feedback.trim() && styles.submitBtnDisabled,
                  ]}
                  disabled={!feedback.trim()}
                  onPress={() => {
                    sendReview({review_type: 'sad', review_feedback: feedback});
                    setFeedback('');
                    transition('Thank you for your feedback.', 'thanks');
                  }}>
                  <Text style={styles.submitBtnText}>Submit Feedback</Text>
                </TouchableOpacity>
              </View>
            )}

            {mode === 'happy' && (
              <View style={styles.reviewButtons}>
                <ReviewButton
                  icon={googleIcon}
                  label="Google Review"
                  subtitle="Takes less than 30 seconds"
                  color="#4285f4"
                  onPress={() => {
                    sendReview({review_type: 'happy', review_source: 'google'});
                    Linking.openURL(
                      'https://www.google.com/search?sca_esv=f49c25a2fc6aefe9&sxsrf=ANbL-n7sUMpR00m5rQ_FbAhYnQYTl-hxCw:1769757923485&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOdq0AxnOEkieNBKI51a4DQ3lm2jeLAzA81w3PrVInqgUXUCvUP6_KNfsrlI3BEnp7ybvAa9Mz3edUqGW94mDOQ79Z0vh0nFL5dLHuQMjJe5J-AZlzA%3D%3D&q=Mayfair+Weight+Loss+Clinic+Reviews&sa=X&ved=2ahUKEwi2rfiC3rKSAxXRl2oFHW3bLcUQ0bkNegQIUBAH',
                    );
                  }}
                />
                <ReviewButton
                  icon={trustpilotIcon}
                  label="Trustpilot Review"
                  subtitle="Takes less than 30 seconds"
                  color="#00b67a"
                  onPress={() => {
                    sendReview({
                      review_type: 'happy',
                      review_source: 'trustpilot',
                    });
                    Linking.openURL(
                      'https://www.trustpilot.com/review/mayfairweightlossclinic.co.uk',
                    );
                  }}
                />
              </View>
            )}

            {mode === 'thanks' && (
              <View style={styles.thanksPanel}>
                <Text style={styles.thanksText}>
                  We're sorry to hear that. Your feedback really matters to us,
                  and we'll definitely work on improving ourselves. Thank you
                  for sharing your experience.
                </Text>
                <TouchableOpacity style={styles.backBtn} onPress={handleDone}>
                  <Text style={styles.backBtnText}>Go to Dashboard</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    </ScrollView>
  );
}

function ReviewButton({icon, label, subtitle, color, onPress}) {
  return (
    <TouchableOpacity style={styles.reviewBtn} onPress={onPress}>
      <View
        style={[
          styles.reviewBtnIcon,
          {backgroundColor: color + '22', borderColor: color + '44'},
        ]}>
        <Image source={icon} style={styles.reviewBtnImg} resizeMode="contain" />
      </View>
      <View style={styles.reviewBtnText}>
        <Text style={styles.reviewBtnLabel}>{label}</Text>
        <Text style={styles.reviewBtnSub}>{subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#4B0082',
  },
  content: {
    padding: 20,
    alignItems: 'center',
  },
  shell: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    alignItems: 'center',
    shadowColor: '#24003D',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  logo: {
    width: 160,
    height: 80,
    marginBottom: 20,
  },
  topBack: {
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  topBackText: {
    fontSize: 16,
    color: '#4B0082',
    fontWeight: '600',
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 28,
    lineHeight: 30,
  },
  emojiRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  emojiCard: {
    width: 130,
    height: 130,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  happyCard: {
    backgroundColor: '#FFF9E6',
    borderWidth: 1,
    borderColor: '#FFE066',
  },
  sadCard: {
    backgroundColor: '#F0F4FF',
    borderWidth: 1,
    borderColor: '#C7D4FF',
  },
  lottie: {
    width: 100,
    height: 100,
  },
  tapText: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  sadPanel: {
    width: '100%',
    alignItems: 'center',
  },
  textarea: {
    width: '100%',
    height: 140,
    borderWidth: 1,
    borderColor: '#E0D6F0',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingTop: 14,
    fontSize: 15,
    color: '#1A1A1A',
    backgroundColor: '#FAFAFA',
    marginBottom: 16,
  },
  submitBtn: {
    backgroundColor: '#4B0082',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  submitBtnDisabled: {
    backgroundColor: '#ccc',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  reviewButtons: {
    width: '100%',
    gap: 12,
  },
  reviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EEE',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    gap: 14,
  },
  reviewBtnIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnImg: {
    width: 22,
    height: 22,
  },
  reviewBtnText: {
    flex: 1,
  },
  reviewBtnLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  reviewBtnSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  thanksPanel: {
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  thanksText: {
    fontSize: 15,
    color: '#374151',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  backBtn: {
    backgroundColor: '#4B0082',
    borderRadius: 50,
    paddingVertical: 14,
    paddingHorizontal: 40,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
