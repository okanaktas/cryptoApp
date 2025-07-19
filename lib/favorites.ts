import { supabase } from './supabase'
import { CryptoCoin } from '../services/cryptoApi'

export interface FavoriteCoin {
  id: string
  user_id: string
  coin_uuid: string
  coin_symbol: string
  coin_name: string
  coin_icon: string
  added_at: string
}

export const favoritesApi = {
  // Kullanıcının favorilerini getir
  async getFavorites(userId: string): Promise<FavoriteCoin[]> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error('Error fetching favorites:', error)
      throw error
    }
  },

  // Favorilere ekle
  async addToFavorites(userId: string, coin: CryptoCoin): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          coin_uuid: coin.id,
          coin_symbol: coin.symbol,
          coin_name: coin.name,
          coin_icon: coin.image
        })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
      throw error
    }
  },

  // Favorilerden çıkar
  async removeFromFavorites(userId: string, coinUuid: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('coin_uuid', coinUuid)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error removing from favorites:', error)
      throw error
    }
  },

  // Coin favorilerde mi kontrol et
  async isFavorite(userId: string, coinUuid: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', userId)
        .eq('coin_uuid', coinUuid)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      return !!data
    } catch (error) {
      console.error('Error checking favorite status:', error)
      return false
    }
  }
} 