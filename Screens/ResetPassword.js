import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
// import your reset password API here
// import { resetPasswordApi } from '../api/resetPasswordApi';

const ResetPassword = () => {
    const route = useRoute();
    const navigation = useNavigation();
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        if (token) {
            window.location.href = `mayfairapp://reset-password?token=${token}`;
        }
    }, []);

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleReset = async () => {
        if (!password || !confirmPassword) {
            Toast.show({ type: 'error', text1: 'Both fields are required' });
            return;
        }

        if (password !== confirmPassword) {
            Toast.show({ type: 'error', text1: 'Passwords do not match' });
            return;
        }

        try {
            setLoading(true);

            // 👇 Replace with actual API call
            // await resetPasswordApi({ token, password });

            Toast.show({ type: 'success', text1: 'Password reset successful!' });
            navigation.navigate('Login');
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Reset failed', text2: 'Please try again.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Reset Your Password</Text>

            <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="New Password"
                value={password}
                onChangeText={setPassword}
            />

            <TextInput
                style={styles.input}
                secureTextEntry
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />

            <TouchableOpacity
                style={styles.button}
                onPress={handleReset}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="#fff" />
                ) : (
                    <Text style={styles.buttonText}>Reset Password</Text>
                )}
            </TouchableOpacity>
        </View>
    );
};

export default ResetPassword;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#fff',
    },
    heading: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    input: {
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        marginBottom: 20,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#4B0082',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
});
