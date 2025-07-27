import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native'
import { AuthProvider } from './contexts/AuthContext'
import { CryptoProvider } from './contexts/CryptoContext'
import { useAuth } from './hooks/useAuth'
import { LoginScreen } from './components/LoginScreen'
import { RegisterScreen } from './components/RegisterScreen'
import { MainScreen } from './components/MainScreen'
import { LaunchScreen } from './components/LaunchScreen'

function AppContent() {
  const [isLogin, setIsLogin] = useState(true)
  const [showLaunchScreen, setShowLaunchScreen] = useState(true)
  const { user, loading } = useAuth()

  // Launch screen gösteriliyor
  if (showLaunchScreen) {
    return <LaunchScreen onFinish={() => setShowLaunchScreen(false)} />
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Yükleniyor...</Text>
      </View>
    )
  }

  if (user) {
    return <MainScreen />
  }

  return (
    <View style={styles.container}>
      {isLogin ? (
        <LoginScreen onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <RegisterScreen onSwitchToLogin={() => setIsLogin(true)} />
      )}
      <StatusBar style="auto" />
    </View>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <CryptoProvider>
        <AppContent />
      </CryptoProvider>
    </AuthProvider>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  }
})
