import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Header from '../Layout/header';
import NextButton from '../Components/NextButton';
import BackButton from '../Components/BackButton';

export default function GPDetails() {
    const navigation = useNavigation();
    const [selected, setSelected] = useState(null); // 'Yes' or 'No'

    return (

        <>

            <Header />
            <ScrollView contentContainerStyle={styles.container}>
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>90% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>GP Details</Text>
                <Text style={styles.subheading}>Are you registered with a GP in the UK?</Text>

                {/* Option Buttons */}
                <View style={styles.optionContainer}>
                    {['Yes', 'No'].map((option) => (
                        <TouchableOpacity
                            key={option}
                            style={[
                                styles.optionBox,
                                selected === option && styles.selectedBox,
                            ]}
                            onPress={() => setSelected(option)}
                        >
                            <Ionicons
                                name={selected === option ? 'checkmark-circle' : 'ellipse-outline'}
                                size={20}
                                color={selected === option ? '#4B0082' : '#999'}
                                style={{ marginRight: 10 }}
                            />
                            <Text style={styles.optionText}>{option}</Text>
                        </TouchableOpacity>
                    ))}
                </View>


                {/* <TouchableOpacity
                    style={[styles.nextButton, !selected && styles.disabledBtn]}
                    onPress={() => navigation.navigate('confirmation-summary')}
                    disabled={!selected}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

               
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity> */}


                <NextButton
                    onPress={() => navigation.navigate('confirmation-summary')}
                    
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
        paddingBottom: 40,
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
        marginBottom: 15,
    },
    subheading: {
        fontSize: 15,
        marginBottom: 20,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    optionBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    selectedBox: {
        backgroundColor: '#eae1ff',
        borderColor: '#4B0082',
    },
    optionText: {
        fontSize: 14,
        color: '#333',
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
