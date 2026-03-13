import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, StatusBar, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import Toast from 'react-native-toast-message';
import "../global.css";
export default function SignIn() {
    const [formData, setFormData] = useState({})
    const [errors, setErrors] = useState({})
    const validateForm = (input, value) => {
        const newErrors = {
            username: errors.username,
            password: errors.password
        }
        if (!value) {
            newErrors[input] = `${input.charAt(0).toUpperCase() + input.slice(1)} is required`;
        } else newErrors[input] = ""
        setErrors((prevErrors) => ({ ...prevErrors, ...newErrors }));
    };
    const sendData = async () => {
        const config = {
            method: "POST",
            body: JSON.stringify({ ...formData }),
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
        }
        const response = await fetch("http://92.205.234.30:7071/api/Login", config).catch((error) => {
            Toast.show({
                type: 'error',
                text1: 'Something Went Wrong!',
                text2: 'Please check your credentials and try again.'
            });
            console.error("Error:", error)
        }).finally(() => console.log("Request completed"));
        if (!response.ok) {
            Toast.show({
                type: 'error',
                text1: 'Login Failed',
                text2: 'Invalid username or password.'
            });
            return
        }
        const data = await response.json();
        console.log("Success:", data);
        Toast.show({
            type: 'success',
            text1: 'Login Successful',
            text2: 'You have successfully logged in.'
        })
    }
    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="bg-[#282C34] flex-1">
            <View className="flex-1 justify-center items-center p-5">
                <StatusBar barStyle={"light-content"} />
                <Image source={require('../assets/logo.png')} className="w-24 h-24 mb-5" />
                <Text className="text-white text-2xl font-bold mb-5">Welcome Back!</Text>
                <TextInput onChange={(e) => { setFormData({ ...formData, username: e.nativeEvent.text }); validateForm("username", e.nativeEvent.text) }} className={`bg-[#282C34] text-white border ${errors.username ? 'border-red-500' : 'border-gray-400'} rounded-md p-2 m-2 w-full`} placeholder='User Name' placeholderTextColor="grey"></TextInput>
                {errors.username && <Text className="text-red-500 self-start">{errors.username}</Text>}
                <TextInput secureTextEntry onChange={(e) => { setFormData({ ...formData, password: e.nativeEvent.text }); validateForm("password", e.nativeEvent.text) }} className={`bg-[#282C34] text-white border ${errors.password ? 'border-red-500' : 'border-gray-400'} rounded-md p-2 m-2 w-full`} placeholder='Password' placeholderTextColor="grey"></TextInput>
                {errors.password && <Text className="text-red-500 self-start">{errors.password}</Text>}
                <Pressable className="w-full bg-[#8a85ff] text-white border rounded-md p-2 m-2 hover:bg-[#5bb8e0]" title='Sign In' color="#61dafb" onPress={() => {
                    if (Object.values(errors).every((error) => error === "")) {
                        sendData()
                    }
                }}>
                    <Text className="text-white text-center">Sign In</Text>
                </Pressable>
                <Pressable className="mt-3" onPress={() => alert('Forgot Password Pressed')}>
                    <Text className="text-[#8a85ff] underline">Forgot Password?</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}