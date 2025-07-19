import { useState, useEffect } from 'react'

const backgroundImages = [
  require('../assets/crypto.jpg'),
  require('../assets/crypto2.jpg'),
  require('../assets/crypto3.jpg'),
  require('../assets/crypto4.jpg'),
  require('../assets/crypto5.jpg')
]

export const useBackgroundRotation = (interval: number = 2000) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      )
    }, interval)

    return () => clearInterval(timer)
  }, [interval])

  return backgroundImages[currentImageIndex]
} 