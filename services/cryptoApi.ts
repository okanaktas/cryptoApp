const API_BASE_URL = 'https://api.coingecko.com/api/v3'

// Cache ve rate limiting için
let lastFetchTime = 0
let cachedCoins: CryptoCoin[] = []
const CACHE_DURATION = 60000 // 1 dakika cache
const MIN_REQUEST_INTERVAL = 1000 // 1 saniye minimum aralık

export interface CryptoCoin {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  market_cap: number
  market_cap_rank: number
  price_change_percentage_24h: number
  total_volume: number
  high_24h: number
  low_24h: number
  price_change_24h: number
  market_cap_change_24h: number
  market_cap_change_percentage_24h: number
  circulating_supply: number
  total_supply: number
  max_supply: number
  ath: number
  ath_change_percentage: number
  ath_date: string
  atl: number
  atl_change_percentage: number
  atl_date: string
  last_updated: string
}

export interface CryptoResponse {
  data: CryptoCoin[]
}

// Rate limiting kontrolü
const checkRateLimit = () => {
  const now = Date.now()
  if (now - lastFetchTime < MIN_REQUEST_INTERVAL) {
    throw new Error('Rate limit: Please wait before making another request')
  }
  lastFetchTime = now
}

// Cache kontrolü
const getCachedData = () => {
  const now = Date.now()
  if (cachedCoins.length > 0 && now - lastFetchTime < CACHE_DURATION) {
    return cachedCoins
  }
  return null
}

export const cryptoApi = {
  // Tüm coinleri getir
  async getCoins(limit: number = 100): Promise<CryptoResponse> {
    try {
      // Cache'den veri kontrol et
      const cached = getCachedData()
      if (cached) {
        return { data: cached.slice(0, limit) }
      }

      // Rate limiting kontrol et
      checkRateLimit()

      const response = await fetch(
        `${API_BASE_URL}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false&locale=en`
      )
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      
      // Cache'e kaydet
      cachedCoins = data
      lastFetchTime = Date.now()
      
      return { data }
    } catch (error) {
      console.error('Error fetching coins:', error)
      
      // Cache'den eski veri varsa onu döndür
      if (cachedCoins.length > 0) {
        console.log('Returning cached data due to API error')
        return { data: cachedCoins.slice(0, limit) }
      }
      
      throw error
    }
  },

  // Belirli bir coin'in detaylarını getir
  async getCoinDetails(id: string) {
    try {
      checkRateLimit()

      const response = await fetch(
        `${API_BASE_URL}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`
      )
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching coin details:', error)
      throw error
    }
  },

  // Trending coinleri getir
  async getTrendingCoins() {
    try {
      checkRateLimit()

      const response = await fetch(
        `${API_BASE_URL}/search/trending`
      )
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.')
      }
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      return { data: data.coins.map((coin: any) => coin.item) }
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      throw error
    }
  },

  // Cache'i temizle
  clearCache() {
    cachedCoins = []
    lastFetchTime = 0
  }
} 