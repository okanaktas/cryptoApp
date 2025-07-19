import React, { createContext, useContext, useState, ReactNode } from 'react'
import { CryptoCoin } from '../services/cryptoApi'

interface CryptoContextType {
  coins: CryptoCoin[]
  setCoins: (coins: CryptoCoin[]) => void
  lastFetchTime: number
  setLastFetchTime: (time: number) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const CryptoContext = createContext<CryptoContextType | undefined>(undefined)

export const useCrypto = () => {
  const context = useContext(CryptoContext)
  if (!context) {
    throw new Error('useCrypto must be used within a CryptoProvider')
  }
  return context
}

interface CryptoProviderProps {
  children: ReactNode
}

export const CryptoProvider: React.FC<CryptoProviderProps> = ({ children }) => {
  const [coins, setCoins] = useState<CryptoCoin[]>([])
  const [lastFetchTime, setLastFetchTime] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  return (
    <CryptoContext.Provider
      value={{
        coins,
        setCoins,
        lastFetchTime,
        setLastFetchTime,
        isLoading,
        setIsLoading
      }}
    >
      {children}
    </CryptoContext.Provider>
  )
} 