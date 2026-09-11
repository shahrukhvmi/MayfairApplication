import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Header from '../Layout/header';
import {Fonts} from '../utils/fonts';

const PRIMARY = '#47317c';

const GOOD_TO_KNOW = [
  'Your consultation will take about five minutes to complete.',
  'All your responses are confidential and securely stored.',
  'We’ll show suitable treatment options based on the information you provide.',
];

export default function StartConsultationIntro() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const handleContinue = () => {
    navigation.navigate('Acknowledgment');
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
        <View style={styles.card}>
          {/* Icon box */}
          <View style={styles.iconBox}>
            <Image
              source={require('../assets/images/intro.png')}
              style={styles.icon}
              resizeMode="contain"
            />
          </View>

          {/* Heading */}
          <Text style={styles.heading}>
            Let's get you started on your weight loss journey.
          </Text>
          <Text style={styles.description}>
            We'll now ask a few questions about you and your health.
          </Text>

          {/* Good to know */}
          <Text style={styles.subheading}>Good to know</Text>
          <View style={styles.bullets}>
            {GOOD_TO_KNOW.map((item, idx) => (
              <View
                key={idx}
                style={[
                  styles.bulletRow,
                  idx === 0 && styles.bulletRowFirst,
                ]}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </View>

          {/* New Patient */}
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={handleContinue}>
            <Text style={styles.primaryText}>New Patient</Text>
            <Text style={styles.primarySub}>
              Click here to start online consultation
            </Text>
          </TouchableOpacity>

          {/* Returning Patient */}
          <TouchableOpacity
            style={styles.outlineBtn}
            activeOpacity={0.85}
            onPress={handleContinue}>
            <Text style={styles.outlineText}>Returning Patient</Text>
            <Text style={styles.outlineSub}>
              Click here - your previous details will be saved
            </Text>
          </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.1)',
    padding: 18,
    shadowColor: 'rgba(71, 49, 124, 0.09)',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 3,
  },
  iconBox: {
    height: 155,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.07)',
    backgroundColor: '#f7f5fc',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  icon: {
    width: 120,
    height: 120,
  },
  heading: {
    fontSize: 20,
    fontFamily: Fonts.semiBold,
    color: '#0f172a',
    lineHeight: 27,
    marginBottom: 8,
  },
  description: {
    fontSize: 13.5,
    fontFamily: Fonts.regular,
    color: '#64748b',
    lineHeight: 21,
    marginBottom: 22,
  },
  subheading: {
    fontSize: 13,
    fontFamily: Fonts.semiBold,
    color: '#1e293b',
    marginBottom: 6,
  },
  bullets: {
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    marginBottom: 22,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  bulletRowFirst: {
    borderTopWidth: 0,
  },
  bulletDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: PRIMARY,
    marginTop: 7,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#475569',
    lineHeight: 19,
  },
  primaryBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  primaryText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: Fonts.semiBold,
  },
  primarySub: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: 'rgba(71, 49, 124, 0.3)',
    borderRadius: 14,
    minHeight: 54,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    backgroundColor: '#fff',
  },
  outlineText: {
    color: PRIMARY,
    fontSize: 15,
    fontFamily: Fonts.medium,
  },
  outlineSub: {
    color: 'rgba(71, 49, 124, 0.75)',
    fontSize: 12,
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
});
