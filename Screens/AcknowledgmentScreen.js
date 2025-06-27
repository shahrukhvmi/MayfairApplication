import Ionicons from 'react-native-vector-icons/Ionicons';

import { useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';

export default function AcknowledgmentScreen() {
  const navigation = useNavigation();
  const [q1, setQ1] = useState(null);
  const [q2, setQ2] = useState(null);
  const [confirmChecked, setConfirmChecked] = useState(false);

  const bothYes = q1 === true && q2 === true;
  const canConfirm = bothYes && confirmChecked;

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.progressText}>0% Completed</Text>
        <Text style={styles.heading}>Acknowledgment</Text>

        {/* Question 1 */}
        <Text style={styles.question}>
          Are you purchasing this medication for yourself, of your own free will and the medicine is for your personal use only?
        </Text>
        <View style={styles.optionRow}>
          <Option label="Yes" selected={q1 === true} onPress={() => setQ1(true)} />
          <Option label="No" selected={q1 === false} onPress={() => setQ1(false)} />
        </View>

        {/* Question 2 */}
        <Text style={styles.question}>
          Do you believe you have the ability to make healthcare decisions for yourself?
        </Text>
        <View style={styles.optionRow}>
          <Option label="Yes" selected={q2 === true} onPress={() => setQ2(true)} />
          <Option label="No" selected={q2 === false} onPress={() => setQ2(false)} />
        </View>

        {/* Confirmation Section */}
        {bothYes && (
          <View style={styles.confirmBox}>
            <TouchableOpacity
              style={styles.confirmHeader}
              onPress={() => setConfirmChecked(!confirmChecked)}
            >
              <Ionicons
                name={confirmChecked ? 'checkbox' : 'square-outline'}
                size={20}
                color={confirmChecked ? '#4B0082' : '#999'}
                style={{ marginRight: 8 }}
              />
              <Text style={styles.confirmTitle}>Do you confirm that:</Text>
            </TouchableOpacity>

            <View style={styles.bulletPoints}>
              {[
                'You consent for your medical information to be assessed by the clinical team at Mayfair Weight Loss Clinic and its pharmacy and to be prescribed medication.',
                'You consent to an age and ID check when placing your first order.',
                'You will answer all questions honestly and accurately, and understand that it is an offence to provide false information.',
              ].map((item, idx) => (
                <View style={styles.bulletRow} key={idx}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Confirm Button */}
        <NextButton
          label="I Confirm"
          loading={false}
          disabled={!canConfirm}
          onPress={() => navigation.navigate('signup')}
        />
      </ScrollView>
    </>
  );
}

const Option = ({ label, selected, onPress }) => {
  const isNo = label.toLowerCase() === 'no';
  const showWarning = selected && isNo;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.option,
        selected && {
          borderColor: isNo ? '#D30000' : '#4B0082',
          backgroundColor: isNo ? '#ffe6e6' : '#f2e9ff',
        },
      ]}
    >
      <Ionicons
        name={selected ? 'checkbox' : 'square-outline'}
        size={20}
        color={showWarning ? '#D30000' : selected ? '#4B0082' : '#888'}
        style={{ marginRight: 8 }}
      />
      <Text style={{ fontWeight: 'bold', color: showWarning ? '#D30000' : '#333' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f3ff',
    flexGrow: 1,
  },
  progressText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    marginBottom: 12,
  },
  heading: {
    fontSize: 26,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 25,
    color: '#2e2e2e',
    fontFamily: 'serif',
  },
  question: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
  },
  option: {
    flex: 0.48,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    marginLeft: 10,
  },
  confirmBox: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#4B0082',
  },
  confirmHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmTitle: {
    fontWeight: 'bold',
    color: '#333',
    fontSize: 15,
  },
  bulletPoints: {
    paddingLeft: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  bulletDot: {
    fontSize: 18,
    lineHeight: 20,
    color: '#4B0082',
    marginRight: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  confirmBtn: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
  },
  btnPurple: {
    backgroundColor: '#4B0082',
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  confirmText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});


