import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
    StyleSheet,
    Image,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { forgotPasswordLink } from '../api/forgotPasswordLinkApi';
import Toast from 'react-native-toast-message';
import {  useNavigation } from '@react-navigation/native';
import { passwordlink } from '../config/constants';

const ForgotPasswordScreen = () => {
    const { control, handleSubmit, formState: { errors }, watch } = useForm();
    const navigation = useNavigation();
    const [resendTimer, setResendTimer] = useState(0);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const submittedEmail = watch('email');

    const forgotLinkMutation = useMutation(forgotPasswordLink);

    useEffect(() => {
        if (isSuccess && resendTimer === 0) {
            setResendTimer(30);
        }
    }, [isSuccess]);




    useEffect(() => {
        let interval = null;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [resendTimer])
    const onSubmit = (data) => {
        setLoading(true);
        console.log(passwordlink, "passwordlink")
        forgotLinkMutation.mutate(
            {
                email: data.email,
                passwordlink: passwordlink,
                clinic_id: 1,
            },
            {
                onSuccess: () => {
                    setIsSuccess(true);
                    Toast.show({
                        type: 'success',
                        text1: 'Success',
                        text2: 'Reset link sent to your email.',
                    });
                },
                onError: (error) => {
                    setLoading(false);
                    const errors = error?.response?.data?.errors;
                    const emailError = error?.response?.data?.errors?.email;
                    console.log(emailError, "emailError")
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: emailError,
                    })
                    console.log(error, "sdasdasdsds")
                    if (errors) {
                        Object.values(errors).flat().forEach(msg =>
                            Toast.show({ type: 'error', text1: 'Error', text2: msg })
                        );
                    } else {
                        Toast.show({ type: 'error', text1: 'Error', text2: 'Something went wrong.' });
                    }
                },
                onSettled: () => {
                    setLoading(false);
                },
            }
        );
    };

    const handleResend = () => {
        if (!submittedEmail) {
            Toast.show({ type: 'error', text1: 'Error', text2: 'Email is missing.' });
            return;
        }

        setResendLoading(true);

        forgotLinkMutation.mutate(
            {
                email: submittedEmail,
                passwordlink: passwordlink,
                clinic_id: 1,
            },
            {
                onSuccess: () => {
                    Toast.show({
                        type: 'success',
                        text1: 'Link Resent',
                        text2: 'Password reset link has been resent.',
                    });
                    setResendTimer(30);
                },
                onError: () => {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'Unable to resend reset link.',
                    });
                },
                onSettled: () => {
                    setResendLoading(false);
                },
            }
        );
    };

    const email = watch('email');
    const isDisabled = !email || loading;
    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.container}>
                        <View style={styles.logoContainer}>
                            <Image source={require('../assets/images/logo-white.png')} style={styles.image} />
                        </View>

                        <View style={styles.subView}>
                            <Text style={styles.subTxt}>Forgot Password</Text>

                            {!isSuccess ? (
                                <>
                                    {/* Email Field */}
                                    <Controller
                                        control={control}
                                        name="email"
                                        rules={{ required: 'Email is required' }}
                                        render={({ field: { onChange, value } }) => (
                                            <TextInput
                                                style={styles.nameInput}
                                                placeholder="Email"
                                                value={value}
                                                onChangeText={onChange}
                                                keyboardType="email-address"
                                                autoCapitalize="none"
                                                placeholderTextColor="#aaa"
                                            />
                                        )}
                                    />
                                    {errors.email && (
                                        <Text style={styles.errorText}>{errors.email.message}</Text>
                                    )}

                                    {/* Submit Button */}
                                    <TouchableOpacity
                                        onPress={handleSubmit(onSubmit)}
                                        disabled={isDisabled}
                                        style={[styles.btn, isDisabled ? styles.btnDisabled : styles.btnEnabled]}
                                    >
                                        {loading ? (
                                            <View style={styles.loadingContent}>
                                                <ActivityIndicator color="#fff" />
                                                <Text style={styles.btnText}> Sending...</Text>
                                            </View>
                                        ) : (
                                            <Text style={styles.btnText}>Send Reset Link</Text>
                                        )}
                                    </TouchableOpacity>

                                </>
                            ) : (
                                <>
                                    <Text style={{ color: 'green', textAlign: 'center', marginBottom: 20 }}>
                                        A password reset link has been sent to your email address.
                                    </Text>
                                    <Text style={{ textAlign: 'center', color: '#555', marginBottom: 20 }}>
                                        Didn’t receive the email? Check your spam or junk folder.
                                    </Text>

                                    <TouchableOpacity
                                        onPress={handleResend}
                                        disabled={resendLoading || resendTimer > 0}
                                        style={[
                                            styles.btn,
                                            resendLoading || resendTimer > 0 ? styles.btnDisabled : styles.btnEnabled,
                                        ]}
                                    >
                                        {resendLoading ? (
                                            <ActivityIndicator color="#fff" />
                                        ) : (
                                            <Text style={styles.btnText}>
                                                {resendTimer > 0
                                                    ? `Resend Link (${resendTimer}s)`
                                                    : 'Resend Password Reset Link'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                </>
                            )}

                            {/* Back to login */}
                            <View style={styles.endView}>
                                <Text style={styles.endTxt}>Remember your password?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                    <Text style={styles.loginTxt}>Login</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default ForgotPasswordScreen;


const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4B0082',
        flex: 1,
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    subView: {
        flex: 1,
        marginTop: 50,
        backgroundColor: 'white',
        width: '100%',
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        alignItems: 'center',
        paddingVertical: 30,
    },
    subTxt: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 20,
        fontFamily: 'Comic Sans MS',
    },
    nameInput: {
        height: 40,
        width: '80%',
        borderBottomWidth: 1,
        marginBottom: 10,
        textAlign: 'start',
        fontSize: 16,
    },
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        width: '80%',
        marginBottom: 10,
        justifyContent: 'space-between',
    },
    forgotTxt: {
        fontSize: 14,
        fontWeight: '600',
        color: '#4B0082',
        textAlign: 'center',
    },

    passwordInput: {
        height: 40,
        width: '85%',
        textAlign: 'start',
        fontSize: 16,
    },
    btn: {
        marginTop: 20,
        height: 50,
        width: '80%',
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    btnEnabled: {
        backgroundColor: '#4B0082',
    },
    btnDisabled: {
        backgroundColor: '#aaa',
    },
    btnText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 16,
    },
    loadingContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    endView: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    endTxt: {
        fontSize: 16,
        fontWeight: '600',
        marginRight: 8,
    },
    loginTxt: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4B0082',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    errorText: {
        color: 'red',
        fontSize: 12,
        marginBottom: 8,
        width: '80%',
        textAlign: 'left',
    },
});
