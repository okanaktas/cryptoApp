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
import { favoritesApi, FavoriteCoin } from '../lib/favorites'
import { useAuth } from '../hooks/useAuth'

interface FavoriteWithData extends FavoriteCoin {
  currentPrice?: string
  currentChange?: string
}

export const DashboardScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteWithData[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const { user } = useAuth()

  const fetchFavorites = async () => {
    if (!user) return

    try {
      setLoading(true)
      const userFavorites = await favoritesApi.getFavorites(user.id)
      
      // Favori coinlerin güncel verilerini al
      const favoritesWithData = await Promise.all(
        userFavorites.map(async (favorite) => {
          try {
            const coinData = await cryptoApi.getCoinDetails(favorite.coin_uuid)
            return {
              ...favorite,
              currentPrice: coinData.data.coin.price,
              currentChange: coinData.data.coin.change
            }
          } catch (error) {
            console.error(`Error fetching data for ${favorite.coin_symbol}:`, error)
            return favorite
          }
        })
      )
      
      setFavorites(favoritesWithData)
    } catch (error) {
      Alert.alert('Hata', 'Favoriler yüklenirken hata oluştu')
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await fetchFavorites()
    setRefreshing(false)
  }

  const removeFavorite = async (coinUuid: string) => {
    if (!user) return

    try {
      await favoritesApi.removeFromFavorites(user.id, coinUuid)
      setFavorites(prev => prev.filter(fav => fav.coin_uuid !== coinUuid))
    } catch (error) {
      Alert.alert('Hata', 'Favori kaldırılırken hata oluştu')
      console.error('Error removing favorite:', error)
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

  const renderFavorite = ({ item }: { item: FavoriteWithData }) => {
    const changeData = item.currentChange ? formatChange(item.currentChange) : null

    return (
      <View style={styles.favoriteItem}>
        <View style={styles.coinInfo}>
          <Image 
            source={{ uri: item.coin_icon }} 
            style={styles.coinIcon}
            defaultSource={require('../assets/icon.png')}
          />
          <View style={styles.coinDetails}>
            <Text style={styles.coinName}>{item.coin_name}</Text>
            <Text style={styles.coinSymbol}>{item.coin_symbol}</Text>
            <Text style={styles.addedDate}>
              Eklenme: {new Date(item.added_at).toLocaleDateString('tr-TR')}
            </Text>
          </View>
        </View>
        
        <View style={styles.coinPrice}>
          {item.currentPrice && (
            <Text style={styles.priceText}>{formatPrice(item.currentPrice)}</Text>
          )}
          {changeData && (
            <Text style={[styles.changeText, { color: changeData.color }]}>
              {changeData.value}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => removeFavorite(item.coin_uuid)}
        >
          <Text style={styles.removeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    )
  }

  useEffect(() => {
    fetchFavorites()
  }, [user])

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Favoriler yükleniyor...</Text>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text style={styles.subtitle}>Favori Coinleriniz</Text>
      
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⭐</Text>
          <Text style={styles.emptyText}>Henüz favori coin eklemediniz</Text>
          <Text style={styles.emptySubtext}>
            Crypto listesinden coin ekleyerek burada takip edebilirsiniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderFavorite}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
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
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: 20,
    color: '#333'
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    paddingBottom: 20,
    color: '#666'
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24
  },
  listContainer: {
    paddingHorizontal: 16
  },
  favoriteItem: {
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
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12
  },
  coinDetails: {
    flex: 1
  },
  coinName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333'
  },
  coinSymbol: {
    fontSize: 16,
    color: '#666',
    marginTop: 2
  },
  addedDate: {
    fontSize: 12,
    color: '#999',
    marginTop: 4
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
  removeButton: {
    padding: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 20,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeIcon: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
}) 