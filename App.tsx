import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView, StyleSheet, ActivityIndicator, View, Text, TouchableOpacity } from 'react-native'
import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './components/LoginScreen'
import { RegisterScreen } from './components/RegisterScreen'

export default function App() {
  const [isLogin, setIsLogin] = useState(true)
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </SafeAreaView>
    )
  }

  if (user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Hoş Geldiniz!</Text>
          <Text style={styles.welcomeText}>{user.email}</Text>
          <Text style={styles.comingSoon}>Crypto listesi yakında burada olacak!</Text>
        </View>
        <StatusBar style="auto" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {isLogin ? (
        <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
      <StatusBar style="auto" />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333'
  },
  welcomeText: {
    fontSize: 18,
    marginBottom: 20,
    color: '#666'
  },
  comingSoon: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center'
  }
})
