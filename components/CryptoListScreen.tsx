import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native'
import { cryptoApi, CryptoCoin } from '../services/cryptoApi'
import { favoritesApi } from '../lib/favorites'
import { useAuth } from '../hooks/useAuth'

export const CryptoListScreen: React.FC = () => {
  const [coins, setCoins] = useState<CryptoCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { user } = useAuth()

  const fetchCoins = async () => {
    try {
      setLoading(true)
      const response = await cryptoApi.getCoins(100)
      setCoins(response.data)
      
      // Favorileri kontrol et (hata olursa sessizce geç)
      if (user) {
        try {
          const userFavorites = await favoritesApi.getFavorites(user.id)
          const favoriteIds = new Set(userFavorites.map(fav => fav.coin_uuid))
          setFavorites(favoriteIds)
        } catch (favoritesError) {
          console.warn('Favorites not loaded:', favoritesError)
          // Favoriler yüklenemezse boş set kullan
          setFavorites(new Set())
        }
      }
    } catch (error) {
      console.error('Error fetching coins:', error)
      
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes('Rate limit')) {
        Alert.alert(
          'API Limit Aşıldı', 
          'Çok fazla istek gönderildi. Lütfen 1 dakika bekleyip tekrar deneyin.',
          [{ text: 'Tamam' }]
        )
      } else {
        Alert.alert('Hata', 'Crypto verileri yüklenirken hata oluştu')
      }
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    try {
      // Cache'i temizle ve yeni veri al
      cryptoApi.clearCache()
      await fetchCoins()
    } catch (error) {
      console.error('Refresh error:', error)
    } finally {
      setRefreshing(false)
    }
  }

  const toggleFavorite = async (coin: CryptoCoin) => {
    if (!user) {
      Alert.alert('Uyarı', 'Favori eklemek için giriş yapmanız gerekiyor')
      return
    }

    try {
      const isFavorite = favorites.has(coin.id)
      
      if (isFavorite) {
        await favoritesApi.removeFromFavorites(user.id, coin.id)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(coin.id)
          return newSet
        })
      } else {
        await favoritesApi.addToFavorites(user.id, coin)
        setFavorites(prev => new Set(prev).add(coin.id))
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      
      // Tablo yoksa kullanıcıya bilgi ver
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('42P01') || errorMessage.includes('relation "favorites" does not exist')) {
        Alert.alert(
          'Favoriler Henüz Hazır Değil', 
          'Favori özelliği yakında aktif olacak. Lütfen daha sonra tekrar deneyin.',
          [{ text: 'Tamam' }]
        )
      } else {
        Alert.alert('Hata', 'Favori işlemi sırasında hata oluştu')
      }
    }
  }

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(4)}`
    }
    return `$${price.toFixed(2)}`
  }

  const formatChange = (change: number) => {
    const isPositive = change >= 0
    return {
      value: `${isPositive ? '+' : ''}${change.toFixed(2)}%`,
      color: isPositive ? '#34C759' : '#FF3B30'
    }
  }

  const renderCoin = ({ item }: { item: CryptoCoin }) => {
    const changeData = formatChange(item.price_change_percentage_24h)
    const isFavorite = favorites.has(item.id)

    return (
      <View style={styles.coinItem}>
        <View style={styles.coinInfo}>
          <Image 
            source={{ uri: item.image }} 
            style={styles.coinIcon}
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.coinDetails}>
            <Text style={styles.coinName}>{item.name}</Text>
            <Text style={styles.coinSymbol}>{item.symbol.toUpperCase()}</Text>
          </View>
        </View>
        
        <View style={styles.coinPrice}>
          <Text style={styles.priceText}>{formatPrice(item.current_price)}</Text>
          <Text style={[styles.changeText, { color: changeData.color }]}>
            {changeData.value}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(item)}
        >
          <Text style={[styles.favoriteIcon, { color: isFavorite ? '#FFD700' : '#ccc' }]}>
            ★
          </Text>
        </TouchableOpacity>
      </View>
    )
  }

  useEffect(() => {
    fetchCoins()
  }, [user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Crypto verileri yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={coins}
        renderItem={renderCoin}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },

  listContainer: {
    paddingHorizontal: 16
  },
  coinItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  coinIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12
  },
  coinDetails: {
    flex: 1
  },
  coinName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  coinSymbol: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  coinPrice: {
    alignItems: 'flex-end',
    marginRight: 12
  },
  priceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333'
  },
  changeText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2
  },
  favoriteButton: {
    padding: 8
  },
  favoriteIcon: {
    fontSize: 24
  }
}) 