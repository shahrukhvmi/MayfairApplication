import {useNavigation} from '@react-navigation/native';
import {useState} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Header from '../Layout/header';

export default function CalculateWeight() {
  const navigation = useNavigation();
  const [unit, setUnit] = useState('kg');
  const [kg, setKg] = useState('');
  const [stone, setStone] = useState('');
  const [pound, setPound] = useState('');

  const isKgValid = unit === 'kg' && kg.trim() !== '';
  const isStLbValid =
    unit === 'st' && (stone.trim() !== '' || pound.trim() !== '');
  const canProceed = isKgValid || isStLbValid;

  return (
    <>
      <Header />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Progress */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar} />
        </View>
        <Text style={styles.progressText}>70% Completed</Text>

        {/* Heading */}
        <Text style={styles.heading}>What is your current weight?</Text>
        <Text style={styles.subText}>
          Your Body Mass Index (BMI) is an important factor in assessing your
          eligibility for treatment. Please enter your weight below to allow us
          to calculate your BMI.
        </Text>

        {/* Unit Switch */}
        <View style={styles.unitToggle}>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'kg' && styles.unitSelected]}
            onPress={() => setUnit('kg')}>
            <Text style={styles.unitText}>kg</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.unitButton, unit === 'st' && styles.unitSelected]}
            onPress={() => setUnit('st')}>
            <Text style={styles.unitText}>st/lb</Text>
          </TouchableOpacity>
        </View>

        {/* Input Fields */}
        {unit === 'kg' ? (
          <>
            <Text style={styles.label}>Kilograms (kg) *</Text>
            <TextInput
              placeholder="Enter your weight in kg"
              keyboardType="numeric"
              style={styles.input}
              value={kg}
              onChangeText={setKg}
            />
          </>
        ) : (
          <>
            <Text style={styles.label}>Stones & Pounds *</Text>
            <View style={styles.row}>
              <TextInput
                placeholder="Stone"
                keyboardType="numeric"
                style={[styles.input, {flex: 1, marginRight: 8}]}
                value={stone}
                onChangeText={setStone}
              />
              <TextInput
                placeholder="Pound"
                keyboardType="numeric"
                style={[styles.input, {flex: 1}]}
                value={pound}
                onChangeText={setPound}
              />
            </View>
          </>
        )}

        {/* Next Button */}
        <TouchableOpacity
          style={[styles.nextButton, !canProceed && styles.disabledBtn]}
          disabled={!canProceed}
          onPress={() => navigation.navigate('bmi')}>
          <Text style={styles.nextText}>Next</Text>
        </TouchableOpacity>

        {/* Back Button */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f5ff',
    flexGrow: 1,
    padding: 24,
  },
  progressContainer: {
    height: 4,
    backgroundColor: '#eee',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    width: '70%',
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
    fontFamily: 'serif',
    marginBottom: 8,
  },
  subText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 20,
  },
  unitToggle: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#f8f5ff',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 15,
  },
  unitButton: {
    flex: 1,
    backgroundColor: 'lightgray',
    padding: 12,
    alignItems: 'center',
  },
  unitSelected: {
    backgroundColor: '#36235C',
    borderColor: '#4B0082',
    color: '#fff',
  },
  unitText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
  },
  nextButton: {
    backgroundColor: '#4B0082',
    borderRadius: 30,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  disabledBtn: {
    backgroundColor: '#ccc',
  },
  nextText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  backText: {
    textAlign: 'center',
    marginTop: 18,
    color: '#4B0082',
    textDecorationLine: 'underline',
  },
});
