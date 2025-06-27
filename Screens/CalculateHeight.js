import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../Layout/header';
export default function Step6Height() {
    const navigation = useNavigation();
    const [unit, setUnit] = useState('cm');
    const [cm, setCm] = useState('');
    const [feet, setFeet] = useState('');
    const [inches, setInches] = useState('');

    const isCmValid = unit === 'cm' && cm.trim() !== '';
    const isFtInValid = unit === 'ft' && (feet.trim() !== '' || inches.trim() !== '');
    const canProceed = isCmValid || isFtInValid;

    return (
        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>70% Completed</Text>

                {/* Title */}
                <Text style={styles.heading}>What is your height?</Text>
                <Text style={styles.subText}>
                    Your Body Mass Index (BMI) is an important factor in assessing your eligibility for treatment. Please enter your height below to allow us to calculate your BMI.
                </Text>

                {/* Unit Switch */}
                <View style={styles.unitToggle}>
                    <TouchableOpacity
                        style={[styles.unitButton, unit === 'cm' && styles.unitSelected]}
                        onPress={() => setUnit('cm')}
                    >
                        <Text style={styles.unitText}>cm</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.unitButton, unit === 'ft' && styles.unitSelected]}
                        onPress={() => setUnit('ft')}
                    >
                        <Text style={styles.unitText}>ft/inch</Text>
                    </TouchableOpacity>
                </View>

                {/* Input Fields */}
                {unit === 'cm' ? (
                    <>
                        <Text style={styles.label}>Centimetres (cm) *</Text>
                        <TextInput
                            placeholder="Enter your height in cm"
                            keyboardType="numeric"
                            style={styles.input}
                            value={cm}
                            onChangeText={setCm}
                        />
                    </>
                ) : (
                    <>
                        <Text style={styles.label}>Feet & Inches *</Text>
                        <View style={styles.row}>
                            <TextInput
                                placeholder="Feet"
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1, marginRight: 8 }]}
                                value={feet}
                                onChangeText={setFeet}
                            />
                            <TextInput
                                placeholder="Inches"
                                keyboardType="numeric"
                                style={[styles.input, { flex: 1 }]}
                                value={inches}
                                onChangeText={setInches}
                            />
                        </View>
                    </>
                )}

                {/* Next */}
                <TouchableOpacity
                    style={[styles.nextButton, !canProceed && styles.disabledBtn]}
                    disabled={!canProceed}
                    onPress={() => navigation.navigate('calculate-weight')}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

                {/* Back */}
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
        borderColor: '#ccc',
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
        color: '#fff'
    },
    unitText: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff'
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
