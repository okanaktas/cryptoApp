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
  Alert,
  Dimensions,
  ScrollView
} from 'react-native'
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit'
import { cryptoApi, CryptoCoin } from '../services/cryptoApi'
import { favoritesApi, FavoriteCoin } from '../lib/favorites'
import { useAuth } from '../hooks/useAuth'
import { useCrypto } from '../contexts/CryptoContext'

const screenWidth = Dimensions.get('window').width

interface FavoriteWithData extends FavoriteCoin {
  currentPrice?: string
  currentChange?: string
  high24h?: number
  low24h?: number
}

export const DashboardScreen: React.FC = () => {
  const [favorites, setFavorites] = useState<FavoriteWithData[]>([])
  const [refreshing, setRefreshing] = useState(false)
  const [chartData, setChartData] = useState<any>(null)
  const { user } = useAuth()
  const { coins } = useCrypto()

  const fetchFavorites = async () => {
    if (!user) return

    try {
      const userFavorites = await favoritesApi.getFavorites(user.id)
      
      // Global state'den coin verilerini kullan
      const favoritesWithData = userFavorites.map((favorite) => {
        const coinData = coins.find(coin => coin.id === favorite.coin_uuid)
        return {
          ...favorite,
          currentPrice: coinData?.current_price?.toString(),
          currentChange: coinData?.price_change_percentage_24h?.toString(),
          high24h: coinData?.high_24h,
          low24h: coinData?.low_24h
        }
      })
      
      setFavorites(favoritesWithData)
      generateChartData(favoritesWithData)
    } catch (error) {
      console.error('Error fetching favorites:', error)
      
      // Tablo yoksa boş liste göster
      const errorMessage = error instanceof Error ? error.message : String(error)
      if (errorMessage.includes('42P01') || errorMessage.includes('relation "favorites" does not exist')) {
        setFavorites([])
      } else {
        Alert.alert('Hata', 'Favoriler yüklenirken hata oluştu')
      }
    }
  }

  const generateChartData = (favoriteCoins: FavoriteWithData[]) => {
    if (favoriteCoins.length === 0) {
      setChartData(null)
      return
    }

    // Portfolio değeri için pie chart data
    const portfolioData = favoriteCoins
      .filter(coin => coin.currentPrice)
      .slice(0, 5) // İlk 5 coin
      .map((coin, index) => ({
        name: coin.coin_symbol.toUpperCase(),
        population: parseFloat(coin.currentPrice || '0'),
        color: `hsl(${(index * 60) % 360}, 70%, 50%)`,
        legendFontColor: '#333',
        legendFontSize: 12
      }))

    // Günlük değişim için bar chart data  
    const changeData = {
      labels: favoriteCoins
        .filter(coin => coin.currentChange)
        .slice(0, 6)
        .map(coin => coin.coin_symbol.toUpperCase()),
      datasets: [{
        data: favoriteCoins
          .filter(coin => coin.currentChange)
          .slice(0, 6)
          .map(coin => parseFloat(coin.currentChange || '0'))
      }]
    }

    // Price range için line chart data (high/low)
    const priceRangeData = {
      labels: favoriteCoins
        .filter(coin => coin.high24h && coin.low24h)
        .slice(0, 5)
        .map(coin => coin.coin_symbol.toUpperCase()),
      datasets: [
        {
          data: favoriteCoins
            .filter(coin => coin.high24h && coin.low24h)
            .slice(0, 5)
            .map(coin => coin.high24h || 0),
          color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`, // green for high
          strokeWidth: 2
        },
        {
          data: favoriteCoins
            .filter(coin => coin.high24h && coin.low24h)
            .slice(0, 5)
            .map(coin => coin.low24h || 0),
          color: (opacity = 1) => `rgba(255, 59, 48, ${opacity})`, // red for low
          strokeWidth: 2
        }
      ]
    }

    setChartData({
      portfolioData,
      changeData,
      priceRangeData
    })
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

  const chartConfig = {
    backgroundColor: '#fff',
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#f8f9fa',
    decimalPlaces: 2,
    color: (opacity = 1) => `rgba(0, 122, 255, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(51, 51, 51, ${opacity})`,
    style: {
      borderRadius: 16
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#007AFF'
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
            onError={() => console.log('Failed to load icon for:', item.coin_name)}
          />
          <View style={styles.coinDetails}>
            <Text style={styles.coinName}>{item.coin_name}</Text>
            <Text style={styles.coinSymbol}>{item.coin_symbol}</Text>
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
  }, [user, coins])

  if (favorites.length === 0 && coins.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Dashboard yükleniyor...</Text>
      </View>
    )
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {favorites.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📈</Text>
          <Text style={styles.emptyText}>Dashboard Boş</Text>
          <Text style={styles.emptySubtext}>
            Favori coinler ekleyerek dashboard'ınızı doldurun ve grafiksel analizleri görün
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.summaryContainer}>
            <Text style={styles.sectionTitle}>Portfolio Özeti</Text>
            <Text style={styles.summaryText}>
              {favorites.length} favori coin • Toplam portföy değeri görünümü
            </Text>
          </View>

          {chartData && chartData.portfolioData && chartData.portfolioData.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>Portfolio Dağılımı</Text>
              <PieChart
                data={chartData.portfolioData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                center={[10, 10]}
                absolute
              />
            </View>
          )}

          {chartData && chartData.changeData && chartData.changeData.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>24 Saatlik Değişim (%)</Text>
              <BarChart
                data={chartData.changeData}
                width={screenWidth - 40}
                height={220}
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => `rgba(52, 199, 89, ${opacity})`,
                }}
                yAxisLabel=""
                yAxisSuffix="%"
                verticalLabelRotation={30}
              />
            </View>
          )}

          {chartData && chartData.priceRangeData && chartData.priceRangeData.labels.length > 0 && (
            <View style={styles.chartContainer}>
              <Text style={styles.chartTitle}>24 Saatlik Fiyat Aralığı (Yüksek/Düşük)</Text>
              <LineChart
                data={chartData.priceRangeData}
                width={screenWidth - 40}
                height={220}
                chartConfig={chartConfig}
                bezier
              />
            </View>
          )}

          <View style={styles.favoritesSection}>
            <Text style={styles.sectionTitle}>Favori Coinlerim</Text>
            <FlatList
              data={favorites}
              renderItem={renderFavorite}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
      )}
    </ScrollView>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 100
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
  summaryContainer: {
    backgroundColor: '#fff',
    padding: 20,
    marginHorizontal: 16,
    marginTop: 10,
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8
  },
  summaryText: {
    fontSize: 14,
    color: '#666'
  },
  chartContainer: {
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
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
  chartTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center'
  },
  favoritesSection: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20
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
  removeButton: {
    padding: 6,
    backgroundColor: '#FF3B30',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeIcon: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold'
  }
}) 