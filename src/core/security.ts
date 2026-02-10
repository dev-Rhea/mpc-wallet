import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = 10;
const AES_KEY = process.env.APP_SECRET || `default_secret_key_32bytes_len`;

export const SecurityUtils = {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, SALT_ROUNDS);
  },

  async comparePassword(plain: string, hashed: string): Promise<boolean> {
    return await bcrypt.compare(plain, hashed);
  },

  encryptData(text: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(AES_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  },
};
