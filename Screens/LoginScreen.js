import React, { useState } from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    ActivityIndicator,
} from 'react-native';

import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMutation } from '@tanstack/react-query';
import { Login } from '../api/loginApi';
import usePasswordReset from '../store/usePasswordReset';
import { logApiError, logApiSuccess } from '../utils/logApiDebug';
import useAuthStore from '../store/authStore';
import useAuthUserDetailStore from '../store/useAuthUserDetailStore';
import useSignupStore from '../store/signupStore';
import Fetcher from '../library/Fetcher';
import Toast from 'react-native-toast-message';

const LoginScreen = () => {
    const navigation = useNavigation();
    const { control, handleSubmit, formState: { errors } } = useForm();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { setIsPasswordReset, setShowResetPassword } = usePasswordReset();
    const { setAuthUserDetail } = useAuthUserDetailStore();
    const { setToken } =
        useAuthStore();
    const { setLastName, setFirstName, setEmail } = useSignupStore();
    const loginMutation = useMutation(Login, {
        onSuccess: (data) => {
            logApiSuccess(data);
            const user = data?.data?.data;

            if (!user?.token) {
                Toast.show({
                    type: 'error',
                    text1: 'Login Error',
                    text2: 'Invalid response: Missing token',
                });
                setLoading(false);
                return;
            }

            setAuthUserDetail(user);
            setToken(user.token);
            Fetcher.axiosSetup.defaults.headers.common.Authorization = `Bearer ${user.token}`;
            setFirstName(user?.fname);
            setLastName(user?.lname);
            setEmail(user?.email);

            navigation.reset({
                index: 0,
                routes: [{ name: 'dashboard' }],
            });

            setIsPasswordReset(false);
            setShowResetPassword(user?.show_password_reset);
            setLoading(false);
        },
        onError: (error) => {
            setLoading(false); // ✅ already here
            logApiError(error);
            console.log('Login Error:', error?.response?.data?.errors?.user);
            Toast.show(error?.response?.data?.errors?.user)

            const apiErrors = error?.response?.data?.errors;
            if (apiErrors && typeof apiErrors === 'object') {
                const messages = Object.values(apiErrors).flat();
                messages.forEach(msg =>
                    Toast.show({
                        type: 'error',
                        text1: 'Login Error',
                        text2: msg,
                    })
                );
            } else {
                Toast.show({
                    type: 'error',
                    text1: 'Login Failed',
                    text2: 'Something went wrong. Please try again.',
                });
            }


        }
    });



    const onSubmit = (data) => {
        console.log("🔒 Submitting:", data);
        setLoading(true);
        const formData = {
            email: data.email,
            password: data.password,
            company_id: 1,
        };
        setEmail(data?.email);
        loginMutation.mutate(formData);
    };

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                    <View style={styles.container}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../assets/images/logo-white.png')}
                                style={styles.image}
                            />
                        </View>

                        <View style={styles.subView}>
                            <Text style={styles.subTxt}>Login</Text>

                            {/* Email */}
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

                            {/* Password */}
                            <View style={styles.passwordContainer}>
                                <Controller
                                    control={control}
                                    name="password"
                                    rules={{ required: 'Password is required' }}
                                    render={({ field: { onChange, value } }) => (
                                        <TextInput
                                            style={styles.passwordInput}
                                            placeholder="Password"
                                            value={value}
                                            onChangeText={onChange}
                                            secureTextEntry={!showPassword}
                                            placeholderTextColor="#aaa"
                                        />
                                    )}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                    <Ionicons
                                        name={showPassword ? 'eye' : 'eye-off'}
                                        size={24}
                                        color="gray"
                                    />
                                </TouchableOpacity>
                            </View>
                            {errors.password && (
                                <Text style={styles.errorText}>{errors.password.message}</Text>
                            )}

                            {/* Login Button (inline version of NextButton) */}
                            <TouchableOpacity
                                onPress={handleSubmit(onSubmit)}
                                disabled={loading}
                                style={[
                                    styles.btn,
                                    loading ? styles.btnDisabled : styles.btnEnabled,
                                ]}
                            >
                                {loading ? (
                                    <View style={styles.loadingContent}>
                                        <ActivityIndicator color="#fff" />
                                        <Text style={styles.btnText}> Logging in...</Text>
                                    </View>
                                ) : (
                                    <Text style={styles.btnText}>Login</Text>
                                )}
                            </TouchableOpacity>

                            {/* Signup */}
                            <View style={styles.endView}>
                                <Text style={styles.endTxt}>Create an account?</Text>
                                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                    <Text style={styles.loginTxt}>SignUp</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
    );
};

export default LoginScreen;

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
        marginTop: 30,
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
