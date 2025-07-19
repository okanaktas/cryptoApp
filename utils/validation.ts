export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (password: string): { isValid: boolean; message?: string } => {
  if (password.length < 6) {
    return { isValid: false, message: 'Şifre en az 6 karakter olmalıdır' }
  }
  
  if (password.length > 128) {
    return { isValid: false, message: 'Şifre çok uzun' }
  }
  
  return { isValid: true }
}

export const validateConfirmPassword = (password: string, confirmPassword: string): boolean => {
  return password === confirmPassword
} 