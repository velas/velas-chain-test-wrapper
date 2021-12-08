export declare const helpers: {
    sleep(seconds: number): Promise<void>;
    stringify(json: any): string;
    bs58EncodedPrivateKeyToBytesArray(privateKey: string): string;
    bytesArrayToHexString(bytesArray: string): string;
};
