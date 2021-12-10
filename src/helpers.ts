import bs58 from "bs58";

export const helpers = {
  async sleep(miliSeconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, miliSeconds));
  },

  stringify(json: any): string {
    return JSON.stringify(json, null, 2);
  },

  bs58EncodedPrivateKeyToBytesArray(privateKey: string): string {
    const privateKeyAsHexString = bs58.decode(privateKey).toString('hex');
    const privateKeyAsBytesArray = Buffer.from(privateKeyAsHexString, 'hex').toJSON().data.toString();

    return privateKeyAsBytesArray;
  },

  bytesArrayToHexString(bytesArray: string): string {
    return Buffer.from(bytesArray).toString('hex');
  },
};
