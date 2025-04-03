import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-very-secure-encryption-key-here';

export function encrypt(text: string): string {
  try {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
}

export function decrypt(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption error:', error);
    return ciphertext;
  }
}

export function encryptAccount(account: any): any {
  try {
    const encryptedAccount = { ...account };
    
    // Encrypt sensitive fields if they exist
    if (account.password) {
      encryptedAccount.password = encrypt(account.password);
    }
    if (account.config) {
      encryptedAccount.config = encrypt(account.config);
    }
    
    return encryptedAccount;
  } catch (error) {
    console.error('Account encryption error:', error);
    return account;
  }
}

export function decryptAccount(account: any): any {
  try {
    const decryptedAccount = { ...account };
    
    // Decrypt sensitive fields if they exist
    if (account.password) {
      decryptedAccount.password = decrypt(account.password);
    }
    if (account.config) {
      decryptedAccount.config = decrypt(account.config);
    }
    
    return decryptedAccount;
  } catch (error) {
    console.error('Account decryption error:', error);
    return account;
  }
} 