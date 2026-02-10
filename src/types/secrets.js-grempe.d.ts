declare module 'secrets.js-grempe' {
  const content: {
    share(secret: string, numShares: number, threshold: number): string[];
    combine(shares: string[]): string;
    newShare(id: number, shares: string[]): string;
    init(bits: number): void;
    getConfig(): any;
    extractShareComponents(share: string): any;
    setRNG(rng: any): void;
    str2hex(str: string): string;
    hex2str(hex: string): string;
    random(bits: number): string;
  };
  export default content;
}
