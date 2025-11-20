import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Link } from 'expo-router';
import { MotiView } from 'moti';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/utils/supabase';

export default function AuthScreen() {
  const [email, setEmail] = useState<string>(''); // Add type annotation for email state
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Erro', error.message);
    }
    setLoading(false);
  }

  return (
    <View className="flex-1 justify-center items-center bg-white px-6">

      {/* Card do formulário */}
      <MotiView
        from={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'timing', duration: 600, delay: 500 }}
        className="w-full"
      >
        {/* Cabeçalho */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-black mb-2 tracking-tight">
            Bem-vindo de volta
          </Text>
          <Text className="text-base text-black/50">
            Continue sua jornada onde parou
          </Text>
        </View>
        
        {/* Input de Email */}
        <View className="mb-5">
          <Text className="text-xs text-black/70 mb-3 tracking-[2px] uppercase font-semibold">
            Email
          </Text>
          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Ionicons 
                name="mail-outline" 
                size={20} 
                color={focusedInput === 'email' ? '#000000' : '#999999'} 
              />
            </View>
            <TextInput
              className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 ${
                focusedInput === 'email' ? 'border-black bg-white' : 'border-gray-200'
              } rounded-2xl text-base text-black`}
              placeholder="seu@email.com"
              placeholderTextColor="#999999"
              value={email}
              onChangeText={setEmail}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>
        
        {/* Input de Senha */}
        <View className="mb-3">
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs text-black/70 tracking-[2px] uppercase font-semibold">
              Senha
            </Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-xs text-black/60 font-medium">
                Esqueceu?
              </Text>
            </TouchableOpacity>
          </View>
          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={focusedInput === 'password' ? '#000000' : '#999999'} 
              />
            </View>
            <TextInput
              className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 ${
                focusedInput === 'password' ? 'border-black bg-white' : 'border-gray-200'
              } rounded-2xl text-base text-black`}
              placeholder="••••••••"
              placeholderTextColor="#999999"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              className="absolute right-4 top-4"
              onPress={() => setShowPassword(!showPassword)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Botão de Login */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 400, delay: 700 }}
        >
          <TouchableOpacity
            className={`w-full py-5 rounded-2xl mt-6 ${
              loading ? 'bg-gray-300' : 'bg-black'
            } shadow-lg`}
            onPress={signInWithEmail}
            disabled={loading}
            activeOpacity={0.8}
          >
            <View className="flex-row items-center justify-center">
              {loading && (
                <View className="mr-2">
                  <Ionicons name="hourglass-outline" size={18} color="white" />
                </View>
              )}
              <Text className="text-white text-center font-bold text-base tracking-[3px]">
                {loading ? 'ENTRANDO...' : 'ENTRAR'}
              </Text>
              {!loading && (
                <View className="ml-2">
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </MotiView>

        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-4 text-xs text-gray-400 font-medium">OU</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Link para registro */}
        <View className="flex-row justify-center items-center">
          <Text className="text-black/60 text-sm">Não possui uma conta? </Text>
          <Link href="/register" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-black font-bold text-sm tracking-wide">
                Criar Conta
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </MotiView>

      {/* Decoração minimalista */}
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.03, scale: 1 }}
        transition={{ type: 'timing', duration: 1500, delay: 800 }}
        className="absolute bottom-0 right-0 w-80 h-80 bg-black rounded-full -mr-40 -mb-40"
      />
      
      <MotiView
        from={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.02, scale: 1 }}
        transition={{ type: 'timing', duration: 1500, delay: 1000 }}
        className="absolute top-0 left-0 w-64 h-64 bg-black rounded-full -ml-32 -mt-32"
      />
    </View>
  );
}