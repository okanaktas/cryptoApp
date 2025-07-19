import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert
} from 'react-native'
import { CryptoListScreen } from './CryptoListScreen'
import { DashboardScreen } from './DashboardScreen'
import { useAuth } from '../hooks/useAuth'

export const MainScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'crypto' | 'dashboard'>('crypto')
  const { logout } = useAuth()

  const handleLogout = async () => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Çıkış Yap',
          style: 'destructive',
          onPress: async () => {
            const result = await logout()
            if (!result.success) {
              Alert.alert('Hata', 'Çıkış yapılırken hata oluştu')
            }
          }
        }
      ]
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {activeTab === 'crypto' ? 'Crypto Piyasası' : 'Dashboard'}
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'crypto' ? <CryptoListScreen /> : <DashboardScreen />}
      </View>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={[styles.navItem, activeTab === 'crypto' && styles.activeNavItem]}
          onPress={() => setActiveTab('crypto')}
        >
          <Text style={[styles.navIcon, activeTab === 'crypto' && styles.activeNavIcon]}>
            📊
          </Text>
          <Text style={[styles.navText, activeTab === 'crypto' && styles.activeNavText]}>
            Piyasa
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, activeTab === 'dashboard' && styles.activeNavItem]}
          onPress={() => setActiveTab('dashboard')}
        >
          <Text style={[styles.navIcon, activeTab === 'dashboard' && styles.activeNavIcon]}>
            ⭐
          </Text>
          <Text style={[styles.navText, activeTab === 'dashboard' && styles.activeNavText]}>
            Favoriler
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333'
  },
  logoutButton: {
    padding: 8
  },
  logoutIcon: {
    fontSize: 24
  },
  content: {
    flex: 1
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingBottom: 20,
    paddingTop: 10
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8
  },
  activeNavItem: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)'
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4
  },
  activeNavIcon: {
    transform: [{ scale: 1.1 }]
  },
  navText: {
    fontSize: 12,
    color: '#666'
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: '600'
  }
}) 