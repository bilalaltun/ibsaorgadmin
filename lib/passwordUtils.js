import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 12;

/**
 * Şifreyi hash'ler
 * @param {string} password - Hash'lenecek şifre
 * @returns {Promise<string>} Hash'lenmiş şifre
 */
export const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Şifreyi doğrular
 * @param {string} password - Doğrulanacak şifre
 * @param {string} hashedPassword - Hash'lenmiş şifre
 * @returns {Promise<boolean>} Şifre doğru mu?
 */
export const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Şifre güvenlik kontrolü
 * @param {string} password - Kontrol edilecek şifre
 * @returns {object} Kontrol sonucu
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors = [];
  
  if (password.length < minLength) {
    errors.push(`Şifre en az ${minLength} karakter olmalıdır`);
  }
  if (!hasUpperCase) {
    errors.push('Şifre en az bir büyük harf içermelidir');
  }
  if (!hasLowerCase) {
    errors.push('Şifre en az bir küçük harf içermelidir');
  }
  if (!hasNumbers) {
    errors.push('Şifre en az bir rakam içermelidir');
  }
  if (!hasSpecialChar) {
    errors.push('Şifre en az bir özel karakter içermelidir');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}; 