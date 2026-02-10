import secrets from 'secrets.js-grempe';

export const SecretSharing = {
  splitKey(privateKey: string, shares: number, threshold: number): string[] {
    return secrets.share(privateKey.replace('0x', ''), shares, threshold);
  },
  combineShares(shares: string[]): string {
    return `0x${secrets.combine(shares)}`;
  },
};
