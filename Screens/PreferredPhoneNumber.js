import { useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import {
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import PhoneInput from 'react-native-phone-number-input';
import Header from '../Layout/header';

export default function PreferredPhoneNumber() {
    const navigation = useNavigation();
    const phoneInput = useRef(null);
    const [phone, setPhone] = useState('');
    const [isValid, setIsValid] = useState(false);


    return (
        <>
            <Header />
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.select({ ios: 'padding', android: undefined })}
            >
                {/* Progress Bar */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar} />
                </View>
                <Text style={styles.progressText}>50% Completed</Text>

                {/* Heading */}
                <Text style={styles.heading}>Enter your phone number</Text>
                <Text style={styles.subText}>
                    Please provide an active phone number to ensure smooth delivery of your order.
                </Text>

                {/* Phone Input */}
                <PhoneInput
                    ref={phoneInput}
                    defaultValue={phone}
                    defaultCode="GB"
                    layout="first"
                    containerStyle={styles.phoneContainer}
                    textContainerStyle={styles.textInput}
                    onChangeFormattedText={(text) => {
                        setPhone(text);
                        const checkValid = phoneInput.current?.isValidNumber(text);
                        setIsValid(!!checkValid);
                    }}
                    withDarkTheme={false}
                    withShadow={false}
                    autoFocus
                />

                {/* Next Button */}
                <TouchableOpacity
                    //   disabled={!isValid}
                    style={[styles.nextButton]}
                    onPress={() => navigation.navigate('ethnicity')}
                >
                    <Text style={styles.nextText}>Next</Text>
                </TouchableOpacity>

                {/* Back */}
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9F7FD',
        padding: 20,
    },
    progressContainer: {
        height: 4,
        backgroundColor: '#eee',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 6,
        marginTop: 20,
    },
    progressBar: {
        width: '50%',
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
        color: '#222',
        marginBottom: 10,
    },
    subText: {
        fontSize: 14,
        color: '#444',
        marginBottom: 25,
    },
    phoneContainer: {
        width: '100%',
        height: 60,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#ccc',
        marginBottom: 25,
        backgroundColor: '#fff',
    },
    textInput: {
        paddingVertical: 0,
        backgroundColor: '#fff',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    nextButton: {
        backgroundColor: '#4B0082',
        borderRadius: 30,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 20,
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
        color: '#4B0082',
        textDecorationLine: 'underline',
        fontSize: 14,
    },
});
