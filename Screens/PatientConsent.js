import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

export default function PatientConsent() {
    const navigation = useNavigation();
    const [accepted, setAccepted] = useState(false);

    return (


        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>90% Completed</Text>

                {/* Title */}
                <Text style={styles.heading}>Patient Consent</Text>

                {/* Consent Text */}
                <View style={styles.consentBox}>
                    <Text style={styles.consentHeader}>I confirm and understand that:</Text>

                    {[
                        'Treatments are sub-cutaneous injections and I feel comfortable administering the medication myself.',
                        'Treatments are prescription-only medication and you must inform your GP/doctor that you have been prescribed this and that you are taking it.',
                        'I confirm that I understand how to store the medication and dispose of the used items responsibly.',
                        'I understand that I need to lose weight by diet, exercise and lifestyle changes. I confirm that taking the weight loss injections must be used with healthy diet and exercise changes.',
                        'I confirm that I will seek medical attention and/or inform my GP if I develop any adverse side effects or symptoms including but not limited to the following: abdominal pain or nausea, a lump in the throat, difficulty swallowing, symptoms of low blood sugar such as sweating, shakiness, dizziness, weakness or fast heartbeat, or any allergic reactions.',
                        'I understand that Prescription Only Medication cannot be returned. I confirm I am aware that you cannot offer a refund if you have received or taken the medication. Mayfair Weight Loss Clinic’s pharmacy is not required to take returns for healthcare safety reasons.',
                        'I confirm that I am aware that prescribed medication may cause side effects including constipation, stomach discomfort, headache, lack of appetite, burning sensation or acid/heartburn pain.',
                        'Medication should be stored in the refrigerator, not frozen or stored in temperatures above 30°C – they must be discarded.',
                        'I confirm I have read, understood and accept Mayfair Weight Loss Clinic’s Terms and Conditions.',
                    ].map((item, index) => (
                        <View key={index} style={styles.bulletItem}>
                            <Text style={styles.bullet}>•</Text>
                            <Text style={styles.bulletText}>{item}</Text>
                        </View>
                    ))}
                </View>

                {/* Consent Confirmation */}
                <TouchableOpacity
                    style={styles.confirmRow}
                    onPress={() => setAccepted((prev) => !prev)}
                >
                    <Ionicons
                        name={accepted ? 'radio-button-on' : 'radio-button-off'}
                        size={20}
                        color={accepted ? '#4B0082' : '#999'}
                    />
                    <Text style={styles.confirmText}>
                        Please confirm you have read and understood the above information related to the treatment prescribed.
                    </Text>
                </TouchableOpacity>

                {/* <TouchableOpacity
                    style={[styles.nextButton, !accepted && styles.disabledBtn]}
                    disabled={!accepted}
                    onPress={() => navigation.navigate('gp-detail')}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity> */}


                <NextButton
                    onPress={() => navigation.navigate('gp-detail')}
                    label='Next'
                />
                <BackButton
                    onPress={() => navigation.goBack()}
                    label='Back'
                />
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
        width: '90%',
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
        marginBottom: 20,
    },
    consentBox: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
    },
    consentHeader: {
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 12,
    },
    bulletItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    bullet: {
        fontSize: 20,
        lineHeight: 22,
        marginRight: 6,
        color: '#4B0082',
    },
    bulletText: {
        flex: 1,
        fontSize: 14,
        color: '#333',
    },
    confirmRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
        gap: 10,
    },
    confirmText: {
        flex: 1,
        color: '#333',
        fontSize: 13,
    },
    nextButton: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
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
