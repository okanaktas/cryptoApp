export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validateUsername = (username: string): { isValid: boolean; message?: string } => {
  if (!username || username.length < 3) {
    return { isValid: false, message: 'Kullanıcı adı en az 3 karakter olmalıdır' }
  }
  
  if (username.length > 20) {
    return { isValid: false, message: 'Kullanıcı adı en fazla 20 karakter olabilir' }
  }
  
  // Sadece harf, rakam, alt çizgi ve tire kabul et
  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    return { isValid: false, message: 'Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir' }
  }
  
  return { isValid: true }
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 8) {
    return { isValid: false, message: 'Şifre en az 8 karakter olmalıdır' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Şifre çok uzun' }
  }
  
  // En az bir büyük harf kontrolü
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir büyük harf içermelidir' }
  }
  
  // En az bir küçük harf kontrolü
  if (!/[a-z]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir küçük harf içermelidir' }
  }
  
  // En az bir rakam kontrolü
  if (!/\d/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir rakam içermelidir' }
  }
  
  // En az bir özel karakter kontrolü
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { isValid: false, message: 'Şifre en az bir özel karakter içermelidir (!@#$%^&* vb.)' }
  }
  
  return { isValid: true }
}

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
}

export const getPasswordStrength = (password: string): { strength: number; color: string; text: string } => {
  let strength = 0
  
  if (password.length >= 8) strength++
  if (/[A-Z]/.test(password)) strength++
  if (/[a-z]/.test(password)) strength++
  if (/\d/.test(password)) strength++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength++
  
  if (strength <= 2) {
    return { strength, color: '#FF3B30', text: 'Zayıf' }
  } else if (strength <= 3) {
    return { strength, color: '#FF9500', text: 'Orta' }
  } else if (strength <= 4) {
    return { strength, color: '#007AFF', text: 'İyi' }
  } else {
    return { strength, color: '#34C759', text: 'Güçlü' }
  }
} 