import { KMSClient } from '@aws-sdk/client-kms';
import dotenv from 'dotenv';

dotenv.config();

export const kmsClient = new KMSClient({
  region: process.env.AWS_REGION || 'ap-northeast-2',
});

export const KMS_KEY_ID = process.env.AWS_KMS_KEY_ID!;
