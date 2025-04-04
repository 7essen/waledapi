import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-very-secure-encryption-key-here';

/**
 * Decrypts an environment variable if it's in the format 'iv:encrypted'
 * @param envVar The environment variable to decrypt
 * @returns The decrypted value or the original value if not encrypted
 */
export function decryptEnvVar(envVar: string | undefined): string | undefined {
  if (!envVar) return undefined;
  
  // Check if the value is in the format 'iv:encrypted'
  if (envVar.includes(':')) {
    try {
      const [ivHex, encrypted] = envVar.split(':');
      const iv = CryptoJS.enc.Hex.parse(ivHex);
      const key = CryptoJS.enc.Hex.parse(ENCRYPTION_KEY);
      
      const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: CryptoJS.enc.Hex.parse(encrypted)
      });
      
      const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        { iv }
      );
      
      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Failed to decrypt environment variable:', error);
      return envVar;
    }
  }
  
  // Return the original value if it's not encrypted
  return envVar;
}

// Get decrypted environment variables
export const getFirebaseConfig = () => {
  return {
    apiKey: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
    authDomain: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
    databaseURL: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL),
    projectId: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: decryptEnvVar(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  };
};

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