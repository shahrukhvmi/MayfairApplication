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

const questions = [
    'Do you have any allergies or intolerances?',
    'Have you been prescribed and are currently taking weight loss medication (including weight loss injections) for weight loss previously?',
    'Are you currently taking any medication (including injections) such as vitamins, antibiotics, contraceptives, fertility agents, or for the treatment of diabetes?',
    'Do you have or previously had any of the following conditions: Type 2 Diabetes, cancer, etc.',
    'Are you using insulin or a sulphonylurea (e.g. gliclazide or chlorpropamide) for either type 1 or type 2 diabetes?',
    'Are you currently taking any other prescribed or bought medication, supplements, or vitamins?',
    'Can you think of any other relevant health or medical information that you feel we should know about?',
    'Have you or anyone in your home, or known to you, ever suffered from an eating disorder?',
];

export default function MedicalQuestions() {
    const navigation = useNavigation();
    const [answers, setAnswers] = useState({});

    const handleSelect = (questionIndex, answer) => {
        setAnswers({ ...answers, [questionIndex]: answer });
    };

    const allAnswered = questions.every((_, i) => answers[i]);

    return (

        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>80% Completed</Text>

                <Text style={styles.heading}>Medical Questions</Text>

                {questions.map((question, index) => (
                    <View key={index} style={styles.questionBox}>
                        <Text style={styles.question}>{question}</Text>
                        <View style={styles.options}>
                            {['Yes', 'No'].map((option) => (
                                <TouchableOpacity
                                    key={option}
                                    style={[
                                        styles.option,
                                        answers[index] === option && styles.selectedOption,
                                    ]}
                                    onPress={() => handleSelect(index, option)}
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            answers[index] === option && styles.selectedOptionText,
                                        ]}
                                    >
                                        {option}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}

                <TouchableOpacity
                    style={[styles.nextButton, !allAnswered && styles.disabledBtn]}
                    onPress={() => navigation.navigate('patient-consent')}
                    disabled={!allAnswered}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

                
            </ScrollView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f8f5ff',
        flexGrow: 1,
        padding: 20,
        paddingBottom: 40,
         paddingBottom:80,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
    },
    progressBar: {
        width: '80%',
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
    questionBox: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        padding: 14,
        marginBottom: 20,
    },
    question: {
        fontSize: 14,
        marginBottom: 10,
        fontWeight: '600',
    },
    options: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical:5,
        maxWidth:120,
    },
    option: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 18,
        marginHorizontal: 10,
        backgroundColor: '#fff',
    },
    selectedOption: {
        backgroundColor: '#eae1ff',
        borderColor: '#4B0082',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
    },
    selectedOptionText: {
        fontWeight: 'bold',
        color: '#4B0082',
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
});
