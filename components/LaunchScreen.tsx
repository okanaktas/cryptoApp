import React, { useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Dimensions
} from 'react-native'

const { width, height } = Dimensions.get('window')

interface LaunchScreenProps {
  onFinish: () => void
}

export const LaunchScreen: React.FC<LaunchScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(0.3)).current
  const textFadeAnim = useRef(new Animated.Value(0)).current

  useEffect(() => {
    // Logo animasyonu
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textFadeAnim, {
        toValue: 1,
        duration: 600,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start()

    // 2.5 saniye sonra launch screen'i kapat
    const timer = setTimeout(() => {
      onFinish()
    }, 2500)

    return () => clearTimeout(timer)
  }, [fadeAnim, scaleAnim, textFadeAnim, onFinish])

  return (
    <ImageBackground 
      source={require('../assets/crypto.jpg')} 
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <Text style={styles.logoIcon}>₿</Text>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.textContainer,
            { opacity: textFadeAnim },
          ]}
        >
          <Text style={styles.appName}>Crypto App</Text>
          <Text style={styles.tagline}>Kripto Para Takip Uygulaması</Text>
        </Animated.View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Animated.Text 
            style={[
              styles.loadingText,
              { opacity: textFadeAnim }
            ]}
          >
            Yükleniyor...
          </Animated.Text>
        </View>
      </View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: width,
    height: height,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  logoIcon: {
    fontSize: 60,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    fontWeight: '300',
    letterSpacing: 1,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 100,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
}) 