import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY || 'your-secret-key-here';

export const encrypt = (text: string): string => {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
};

export const decrypt = (ciphertext: string): string => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const encryptAccount = (account: any) => {
  const encryptedAccount = { ...account };
  
  if (encryptedAccount.password) {
    encryptedAccount.password = encrypt(encryptedAccount.password);
  }
  
  if (encryptedAccount.config) {
    encryptedAccount.config = encrypt(encryptedAccount.config);
  }
  
  return encryptedAccount;
};

export const decryptAccount = (account: any) => {
  const decryptedAccount = { ...account };
  
  if (decryptedAccount.password) {
    decryptedAccount.password = decrypt(decryptedAccount.password);
  }
  
  if (decryptedAccount.config) {
    decryptedAccount.config = decrypt(decryptedAccount.config);
  }
  
  return decryptedAccount;
}; 