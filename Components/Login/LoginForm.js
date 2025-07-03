import React from "react";
import { View, Text } from "react-native";
import { useForm, Controller } from "react-hook-form";

import { useNavigation } from "@react-navigation/native";
import TextFields from "../TextFields";
import NextButton from "../NextButton";
import BackButton from "../BackButton";

export default function LoginForm({ onLogin, onForgot, isLoading }) {
  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const nav = useNavigation();

  return (
    <View style={{ padding: 16 }}>
      {/* -------- email -------- */}
      <Controller
        control={control}
        name="email"
        rules={{
          required: "Email is required",
          pattern: {
            value: /^\S+@\S+$/i,
            message: "Enter a valid email"
          }
        }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextFields
              label="Email Address"
              placeholder="Email"
              type="email"
              required
              value={value}
              onChangeText={onChange}
            />
            {errors.email && (
              <Text style={{ color: "red", marginTop: -12, marginBottom: 8 }}>
                {errors.email.message}
              </Text>
            )}
          </>
        )}
      />

      {/* -------- password -------- */}
      <Controller
        control={control}
        name="password"
        rules={{ required: "Password is required", minLength: 6 }}
        render={({ field: { onChange, value } }) => (
          <>
            <TextFields
              label="Password"
              placeholder="Password"
              type="password"
              required
              value={value}
              onChangeText={onChange}
            />
            {errors.password && (
              <Text style={{ color: "red", marginTop: -12, marginBottom: 8 }}>
                {errors.password.message}
              </Text>
            )}
          </>
        )}
      />

      {/* -------- buttons -------- */}
      <NextButton
        label="Login"
        onPress={handleSubmit(onLogin)}
        disabled={isLoading}
      />

      <Text style={{ textAlign: "center", marginTop: 20, fontSize: 14 }}>
        Are you a new patient?{" "}
        <Text
          onPress={() => nav.navigate("Acknowledgment")}
          style={{ color: "#57299D", textDecorationLine: "underline" }}
        >
          Get started with the consultation
        </Text>
      </Text>

      <View style={{ marginTop: 10 }}>
        <BackButton onPress={onForgot} label="Forgot Password?" />
      </View>
    </View>
  );
}
