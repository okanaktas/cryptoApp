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
      setCoins(response.data.coins)
      
      // Favorileri kontrol et
      if (user) {
        const userFavorites = await favoritesApi.getFavorites(user.id)
        const favoriteUuids = new Set(userFavorites.map(fav => fav.coin_uuid))
        setFavorites(favoriteUuids)
      }
    } catch (error) {
      Alert.alert('Hata', 'Crypto verileri yüklenirken hata oluştu')
      console.error('Error fetching coins:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchCoins()
    setRefreshing(false)
  }

  const toggleFavorite = async (coin: CryptoCoin) => {
    if (!user) return

    try {
      const isFavorite = favorites.has(coin.uuid)
      
      if (isFavorite) {
        await favoritesApi.removeFromFavorites(user.id, coin.uuid)
        setFavorites(prev => {
          const newSet = new Set(prev)
          newSet.delete(coin.uuid)
          return newSet
        })
      } else {
        await favoritesApi.addToFavorites(user.id, coin)
        setFavorites(prev => new Set(prev).add(coin.uuid))
      }
    } catch (error) {
      Alert.alert('Hata', 'Favori işlemi sırasında hata oluştu')
      console.error('Error toggling favorite:', error)
    }
  }

  const formatPrice = (price: string) => {
    const numPrice = parseFloat(price)
    if (numPrice < 1) {
      return `$${numPrice.toFixed(4)}`
    }
    return `$${numPrice.toFixed(2)}`
  }

  const formatChange = (change: string) => {
    const numChange = parseFloat(change)
    const isPositive = numChange >= 0
    return {
      value: `${isPositive ? '+' : ''}${numChange.toFixed(2)}%`,
      color: isPositive ? '#34C759' : '#FF3B30'
    }
  }

  const renderCoin = ({ item }: { item: CryptoCoin }) => {
    const changeData = formatChange(item.change)
    const isFavorite = favorites.has(item.uuid)

    return (
      <View style={styles.coinItem}>
        <View style={styles.coinInfo}>
          <Image 
            source={{ uri: item.iconUrl }} 
            style={styles.coinIcon}
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.coinDetails}>
            <Text style={styles.coinName}>{item.name}</Text>
            <Text style={styles.coinSymbol}>{item.symbol}</Text>
          </View>
        </View>
        
        <View style={styles.coinPrice}>
          <Text style={styles.priceText}>{formatPrice(item.price)}</Text>
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
      <Text style={styles.title}>Crypto Piyasası</Text>
      <FlatList
        data={coins}
        renderItem={renderCoin}
        keyExtractor={(item) => item.uuid}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20,
    color: '#333'
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