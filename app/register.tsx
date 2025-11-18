import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { supabase } from '@/utils/supabase';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signUpWithEmail() {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else if (data.session) {
      Alert.alert('Success', 'You are now signed in!');
    } else if (data.user) {
      Alert.alert('Success', 'Please check your email to confirm your account!');
    }
    
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">
      {/* Logo com Kanji */}
      <MotiView
        from={{ opacity: 0, translateY: -20 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 800, delay: 100 }}
        className="items-center mb-12"
      >
        <View className="w-20 h-20 bg-black rounded-2xl justify-center items-center mb-4 shadow-md">
          <Text className="text-white text-4xl font-light">月</Text>
        </View>
        
        <Text className="text-3xl font-light text-black tracking-wider mb-1">
          月闇
        </Text>
        <Text className="text-lg font-bold text-black tracking-widest">
          TSUKIYAMI
        </Text>
      </MotiView>

      {/* Card do formulário */}
      <MotiView
        from={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 600, delay: 300 }}
        className="w-full max-w-md"
      >
        <Text className="text-2xl font-bold text-black mb-2 tracking-tight">
          Criar Sua Conta
        </Text>
        <Text className="text-sm text-black/50 mb-8 tracking-wide">
          Junte-se a nós e compartilhe sua paixão
        </Text>
        
        {/* Input de Nome */}
        <View className="mb-4">
          <Text className="text-xs text-black/70 mb-2 tracking-widest uppercase font-medium">
            First Name
          </Text>
          <TextInput
            className="w-full px-4 py-4 bg-black/5 border-2 border-black/10 rounded-xl text-base text-black focus:border-black"
            placeholder="Your first name"
            placeholderTextColor="#00000040"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        <View className="mb-4">
          <Text className="text-xs text-black/70 mb-2 tracking-widest uppercase font-medium">
            Last Name
          </Text>
          <TextInput
            className="w-full px-4 py-4 bg-black/5 border-2 border-black/10 rounded-xl text-base text-black focus:border-black"
            placeholder="Your last name"
            placeholderTextColor="#00000040"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

        {/* Input de Email */}
        <View className="mb-4">
          <Text className="text-xs text-black/70 mb-2 tracking-widest uppercase font-medium">
            Email
          </Text>
          <TextInput
            className="w-full px-4 py-4 bg-black/5 border-2 border-black/10 rounded-xl text-base text-black focus:border-black"
            placeholder="your@email.com"
            placeholderTextColor="#00000040"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        {/* Input de Senha */}
        <View className="mb-6">
          <Text className="text-xs text-black/70 mb-2 tracking-widest uppercase font-medium">
            Senha
          </Text>
          <TextInput
            className="w-full px-4 py-4 bg-black/5 border-2 border-black/10 rounded-xl text-base text-black focus:border-black"
            placeholder="••••••••"
            placeholderTextColor="#00000040"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        
        {/* Botão de Registro */}
        <TouchableOpacity
          className={`w-full py-4 rounded-xl ${loading ? 'bg-black/50' : 'bg-black'} shadow-lg`}
          onPress={signUpWithEmail}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-base tracking-wider">
            {loading ? 'CRIANDO CONTA...' : 'CRIAR CONTA'}
          </Text>
        </TouchableOpacity>

        {/* Link para login */}
        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-black/60 text-sm">Already have an account? </Text>
          <Link href="/auth" asChild>
            <TouchableOpacity>
              <Text className="text-black  underline font-bold text-sm tracking-wide">
                Entrar
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MotiView>

      {/* Decoração minimalista */}
      <MotiView
        from={{ opacity: 0 }}
        animate={{ opacity: 0.05 }}
        transition={{ type: 'timing', duration: 1200, delay: 600 }}
        className="absolute top-0 left-0 w-64 h-64 bg-black rounded-full -ml-32 -mt-32"
      />
    </View>
  );
}