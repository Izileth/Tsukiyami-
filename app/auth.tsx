import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { supabase } from '@/utils/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
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
          Bem Vindo de Volta
        </Text>
        <Text className="text-sm text-black/50 mb-8 tracking-wide">
          Faça login para continuar sua jornada
        </Text>
        
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
        
        {/* Botão de Login */}
        <TouchableOpacity
          className={`w-full py-4 rounded-xl ${loading ? 'bg-black/50' : 'bg-black'} shadow-lg`}
          onPress={signInWithEmail}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text className="text-white text-center font-bold text-base tracking-wider">
            {loading ? 'CARREGANDO...' : 'ENTRAR'}
          </Text>
        </TouchableOpacity>

        {/* Link para registro */}
        <View className="flex-row justify-center mt-8 items-center">
          <Text className="text-black/60 text-sm">Nao possui uma conta? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="text-black underline font-bold text-sm tracking-wide">
                Criar Conta
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
        className="absolute bottom-0 right-0 w-64 h-64 bg-black rounded-full -mr-32 -mb-32"
      />
    </View>
  );
}
