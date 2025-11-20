import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { Link, usePathname, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProfile } from '@/context/ProfileContext';
import { MotiView } from 'moti';


const navItems = [
  { href: '/', icon: 'home-outline', activeIcon: 'home', label: 'Home' },
  { href: '/explore', icon: 'compass-outline', activeIcon: 'compass', label: 'Explorar' },
] as const;

const GlobalHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useProfile();

  const getInitials = (name: string) => {
    if (!name) return '?';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <SafeAreaView edges={['top']} className="bg-white ">
      <View className="flex-row justify-between items-center px-6 py-3">
        {/* Logo */}
        <TouchableOpacity 
          onPress={() => router.push('/')}
          activeOpacity={0.7}
          className="flex-row items-center"
        >
          <Ionicons name="flash" size={24} color="#000000" />
        </TouchableOpacity>

        {/* Navigation */}
        <View className="flex-row items-center gap-1">
          {navItems.map((item, index) => {
            const isActive = pathname === item.href;
            
            return (
              <Link key={item.href} href={item.href } asChild>
                <TouchableOpacity 
                  className={`px-4 py-2 rounded-xl ${
                    isActive ? 'bg-black' : 'bg-transparent'
                  }`}
                  activeOpacity={0.7}
                >
                  <MotiView
                    animate={{
                      scale: isActive ? 1.1 : 1,
                    }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                    }}
                  >
                    <Ionicons
                      name={isActive ? item.activeIcon : item.icon}
                      size={22}
                      color={isActive ? '#ffffff' : '#000000'}
                    />
                  </MotiView>
                </TouchableOpacity>
              </Link>
            );
          })}

          {/* Profile Avatar */}
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            activeOpacity={0.7}
            className="ml-2"
          >
            {profile?.avatar_url ? (
              <MotiView
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <View className={`w-10 h-10 rounded-full overflow-hidden ${
                  pathname === '/profile' ? 'border-2 border-black' : 'border border-gray-200'
                }`}>
                  <Image 
                    source={{ uri: profile.avatar_url }} 
                    className="w-full h-full"
                    resizeMode="cover"
                  />
                </View>
              </MotiView>
            ) : (
              <MotiView
                from={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 15 }}
              >
                <View className={`w-10 h-10 rounded-full justify-center items-center ${
                  pathname === '/profile' 
                    ? 'bg-black border-2 border-black' 
                    : 'bg-gray-100 border border-gray-200'
                }`}>
                  <Text className={`text-sm font-bold ${
                    pathname === '/profile' ? 'text-white' : 'text-black/70'
                  }`}>
                    {profile?.name ? getInitials(profile.name) : '?'}
                  </Text>
                </View>
              </MotiView>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default GlobalHeader;