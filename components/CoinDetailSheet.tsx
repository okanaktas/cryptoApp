import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView
} from 'react-native'
import Modal from 'react-native-modal'
import { CryptoCoin } from '../services/cryptoApi'
import { Ionicons } from '@expo/vector-icons'

interface CoinDetailSheetProps {
  coin: CryptoCoin | null
  isVisible: boolean
  onClose: () => void
  onToggleFavorite: (coin: CryptoCoin) => void
  isFavorite: boolean
}

const { width } = Dimensions.get('window')

export const CoinDetailSheet: React.FC<CoinDetailSheetProps> = ({
  coin,
  isVisible,
  onClose,
  onToggleFavorite,
  isFavorite
}) => {
  // Coin yoksa veya sheet görünür değilse hiçbir şey render etme
  if (!coin || !isVisible) return null

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

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) {
      return `$${(marketCap / 1e12).toFixed(2)}T`
    } else if (marketCap >= 1e9) {
      return `$${(marketCap / 1e9).toFixed(2)}B`
    } else if (marketCap >= 1e6) {
      return `$${(marketCap / 1e6).toFixed(2)}M`
    } else {
      return `$${marketCap.toLocaleString()}`
    }
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e12) {
      return `$${(volume / 1e12).toFixed(2)}T`
    } else if (volume >= 1e9) {
      return `$${(volume / 1e9).toFixed(2)}B`
    } else if (volume >= 1e6) {
      return `$${(volume / 1e6).toFixed(2)}M`
    } else {
      return `$${volume.toLocaleString()}`
    }
  }

  const changeData = formatChange(coin.price_change_percentage_24h)

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection={['down']}
      style={styles.modal}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.5}
    >
      <View style={styles.container}>
        {/* Handle Indicator */}
        <View style={styles.handleIndicator} />
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.coinInfo}>
            <Image source={{ uri: coin.image }} style={styles.coinIcon} />
            <View style={styles.coinDetails}>
              <Text style={styles.coinName}>{coin.name}</Text>
              <Text style={styles.coinSymbol}>{coin.symbol.toUpperCase()}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={() => onToggleFavorite(coin)}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? '#FF3B30' : '#666'}
            />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Price Section */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>{formatPrice(coin.current_price)}</Text>
            <Text style={[styles.change, { color: changeData.color }]}>
              {changeData.value}
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Market Cap</Text>
              <Text style={styles.statValue}>{formatMarketCap(coin.market_cap)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>24h Volume</Text>
              <Text style={styles.statValue}>{formatVolume(coin.total_volume)}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Circulating Supply</Text>
              <Text style={styles.statValue}>
                {coin.circulating_supply.toLocaleString()} {coin.symbol.toUpperCase()}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Rank</Text>
              <Text style={styles.statValue}>#{coin.market_cap_rank}</Text>
            </View>
          </View>

          {/* Price Range */}
          <View style={styles.priceRange}>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>24h High</Text>
              <Text style={styles.rangeValue}>{formatPrice(coin.high_24h)}</Text>
            </View>
            <View style={styles.rangeItem}>
              <Text style={styles.rangeLabel}>24h Low</Text>
              <Text style={styles.rangeValue}>{formatPrice(coin.low_24h)}</Text>
            </View>
          </View>

          {/* All Time Stats */}
          <View style={styles.allTimeStats}>
            <View style={styles.allTimeItem}>
              <Text style={styles.allTimeLabel}>All Time High</Text>
              <Text style={styles.allTimeValue}>{formatPrice(coin.ath)}</Text>
              <Text style={styles.allTimeDate}>
                {new Date(coin.ath_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
            <View style={styles.allTimeItem}>
              <Text style={styles.allTimeLabel}>All Time Low</Text>
              <Text style={styles.allTimeValue}>{formatPrice(coin.atl)}</Text>
              <Text style={styles.allTimeDate}>
                {new Date(coin.atl_date).toLocaleDateString('tr-TR')}
              </Text>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Son güncelleme: {new Date(coin.last_updated).toLocaleString('tr-TR')}
            </Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    padding: 20,
  },
  handleIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#ccc',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  coinInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  coinIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  coinDetails: {
    flex: 1,
  },
  coinName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  coinSymbol: {
    fontSize: 16,
    color: '#666',
    marginTop: 2,
  },
  favoriteButton: {
    padding: 8,
  },
  priceSection: {
    marginBottom: 25,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  change: {
    fontSize: 18,
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 25,
  },
  statItem: {
    width: '50%',
    marginBottom: 20,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  priceRange: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  rangeItem: {
    alignItems: 'center',
  },
  rangeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  rangeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  allTimeStats: {
    marginBottom: 20,
  },
  allTimeItem: {
    marginBottom: 15,
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  allTimeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  allTimeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  allTimeDate: {
    fontSize: 12,
    color: '#999',
  },
  lastUpdated: {
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#999',
  },
}) 