import asn1 from 'asn1.js';
import { ethers } from 'ethers';

const EcdsaPubKey = asn1.define('EcdsaPubKey', function (this: any) {
  this.seq().obj(this.key('algo').seq().obj(this.key('a').objid(), this.key('b').objid()), this.key('pubKey').bitstr());
});

export const getEthereumAddressFromKMS = (publicKeyBuffer: Uint8Array): string => {
  const res = EcdsaPubKey.decode(Buffer.from(publicKeyBuffer), 'der');

  const pubKeyBuffer = res.pubKey.data;

  const address = ethers.utils.computeAddress(pubKeyBuffer);

  return address;
};
