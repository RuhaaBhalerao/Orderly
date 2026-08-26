/**
 * Encryption utilities for sensitive data
 * Uses crypto built-in module for AES-256-GCM encryption
 */

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 
  crypto.createHash('sha256').update(process.env.JWT_SECRET || 'default-key').digest();

/**
 * Encrypt sensitive data (e.g., Gmail tokens)
 * Uses AES-256-GCM with random IV
 */
export function encryptData(data: string): string {
  if (!data) return '';
  
  // Generate random IV (16 bytes)
  const iv = crypto.randomBytes(16);
  
  // Create cipher
  const cipher = crypto.createCipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
  
  // Encrypt data
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Get auth tag
  const authTag = cipher.getAuthTag();
  
  // Return IV + authTag + encrypted data (all hex encoded)
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

/**
 * Decrypt sensitive data
 */
export function decryptData(encryptedData: string): string {
  if (!encryptedData) return '';
  
  try {
    // Split IV, authTag, and encrypted data
    const [ivHex, authTagHex, encrypted] = encryptedData.split(':');
    
    if (!ivHex || !authTagHex || !encrypted) {
      throw new Error('Invalid encrypted data format');
    }
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt data
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
}

/**
 * Hash data (one-way) for storage/comparison
 */
export function hashData(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}
