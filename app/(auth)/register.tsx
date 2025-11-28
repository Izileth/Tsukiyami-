import { supabase } from '@/utils/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          name: email, // Use email as default name, user can update later
        },
      },
    });

    if (error) {
      Alert.alert('Erro', error.message);
    }
    else if (data.session) {
      Alert.alert('Sucesso', 'Você está logado!');
    }
    else if (data.user) {
      Alert.alert('Sucesso', 'Verifique seu email para confirmar sua conta!');
    }
    
    setLoading(false);
  }

  return (
    <ScrollView 
      className="flex-1 bg-white"
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
      showsVerticalScrollIndicator={false}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >

        {/* Card do formulário */}
        <View
          className="w-full  pt-60"
        >
        {/* Cabeçalho */}
        <View className="mb-8">
          <Text className="text-3xl font-bold text-black mb-2 tracking-tight">
            Comece sua jornada
          </Text>
          <Text className="text-base text-black/50">
            Crie sua conta em poucos passos
          </Text>
        </View>
        
        {/* Input de Email */}
        <View className="mb-4">
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
        <View className="mb-4">
          <Text className="text-xs text-black/70 mb-3 tracking-[2px] uppercase font-semibold">
            Senha
          </Text>
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
          {password.length > 0 && password.length < 6 && (
            <Text className="text-xs text-red-500 mt-2 ml-1">
              A senha deve ter pelo menos 6 caracteres
            </Text>
          )}
        </View>
        
        {/* Input de Confirmar Senha */}
        <View className="mb-3">
          <Text className="text-xs text-black/70 mb-3 tracking-[2px] uppercase font-semibold">
            Confirmar Senha
          </Text>
          <View className="relative">
            <View className="absolute left-4 top-4 z-10">
              <Ionicons 
                name="lock-closed-outline" 
                size={20} 
                color={focusedInput === 'confirmPassword' ? '#000000' : '#999999'} 
              />
            </View>
            <TextInput
              className={`w-full pl-12 pr-12 py-4 bg-gray-50 border-2 ${
                focusedInput === 'confirmPassword' ? 'border-black bg-white' : 'border-gray-200'
              } rounded-2xl text-base text-black`}
              placeholder="••••••••"
              placeholderTextColor="#999999"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              onFocus={() => setFocusedInput('confirmPassword')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity 
              className="absolute right-4 top-4"
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} 
                size={20} 
                color="#999999" 
              />
            </TouchableOpacity>
          </View>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <Text className="text-xs text-red-500 mt-2 ml-1">
              As senhas não coincidem
            </Text>
          )}
        </View>
        
        {/* Botão de Registro */}
        <View>
          <TouchableOpacity
            className={`w-full py-5 rounded-2xl mt-6 ${
              loading ? 'bg-gray-300' : 'bg-black'
            } shadow-lg`}
            onPress={signUpWithEmail}
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
                {loading ? 'CRIANDO...' : 'CRIAR CONTA'}
              </Text>
              {!loading && (
                <View className="ml-2">
                  <Ionicons name="arrow-forward" size={18} color="white" />
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View className="flex-row items-center my-8">
          <View className="flex-1 h-[1px] bg-gray-200" />
          <Text className="mx-4 text-xs text-gray-400 font-medium">OU</Text>
          <View className="flex-1 h-[1px] bg-gray-200" />
        </View>

        {/* Link para login */}
        <View className="flex-row justify-center items-center">
          <Text className="text-black/60 text-sm">Já possui uma conta? </Text>
          <Link href="/auth" asChild>
            <TouchableOpacity activeOpacity={0.7}>
              <Text className="text-black underline font-bold text-sm tracking-wide">
                Entrar
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
}