const API_BASE_URL = 'https://api.coinranking.com/v2'
const API_KEY = '53a0b0a7e4f2fa59519e4' // Free tier API key

export interface CryptoCoin {
  uuid: string
  symbol: string
  name: string
  color: string
  iconUrl: string
  marketCap: string
  price: string
  listedAt: number
  tier: number
  change: string
  rank: number
  sparkline: string[]
  lowVolume: boolean
  coinrankingUrl: string
  '24hVolume': string
  btcPrice: string
}

export interface CryptoResponse {
  status: string
  data: {
    coins: CryptoCoin[]
    stats: {
      total: number
      totalCoins: number
      totalMarkets: number
      totalExchanges: number
      totalMarketCap: string
      total24hVolume: string
    }
  }
}

export const cryptoApi = {
  // Tüm coinleri getir
  async getCoins(limit: number = 50): Promise<CryptoResponse> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/coins?limit=${limit}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_KEY,
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching coins:', error)
      throw error
    }
  },

  // Belirli bir coin'in detaylarını getir
  async getCoinDetails(uuid: string) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/coin/${uuid}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_KEY,
          },
        }
      )
      
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
      const response = await fetch(
        `${API_BASE_URL}/coins?orderBy=change&orderDirection=desc&limit=10`,
        {
          headers: {
            'Content-Type': 'application/json',
            'x-access-token': API_KEY,
          },
        }
      )
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error fetching trending coins:', error)
      throw error
    }
  }
} 