import dotenv from 'dotenv';

dotenv.config();

export const config = {
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    secret: process.env.APP_SECRET || 'default-secret-key',
  },
  db: {
    url: process.env.DATABASE_URL,
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'ap-northeast-2',
    kmsKeyId: process.env.AWS_KMS_KEY_ID,
  },
  blockchain: {
    rpcUrl: process.env.RPC_URL || 'http://localhost:8545',
    chainId: parseInt(process.env.CHAIN_ID || '1337', 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'jwt-secret-key',
    expiresIn: '1d',
  },
};
