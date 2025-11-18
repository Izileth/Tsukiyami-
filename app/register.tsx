import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { supabase } from '@/utils/supabase';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      // This case happens if auto-confirm is on
      Alert.alert('Success', 'You are now signed in!');
    } else if (data.user) {
      // This is the standard case, user needs to confirm their email
      Alert.alert('Success', 'Please check your email to confirm your account!');
    }
    
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-slate-50 p-4">
      <View className="w-full max-w-sm">
        <Text className="text-3xl font-bold text-center text-gray-800 mb-6">Create Account</Text>
        
        <TextInput
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg mb-4 text-base"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        
        <TextInput
          className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg mb-6 text-base"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className={`w-full py-3 rounded-lg ${loading ? 'bg-blue-400' : 'bg-blue-500'}`}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          <Text className="text-white text-center font-bold text-lg">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Already have an account? </Text>
          <Link href="/auth">
            <Text className="text-blue-500 font-bold">Sign In</Text>
          </Link>
        </View>
      </View>
    </View>
  );
}
