/// <reference types="node" />
import { Account, AccountMeta, ConfirmedBlock, Connection, PublicKey, StakeActivationData } from '@velas/web3';
import nacl from 'tweetnacl';
declare class AccountObj {
    seed: string;
    account: Account;
    bufferedSeed: Buffer;
    keyPair: nacl.SignKeyPair;
    pubKey: Uint8Array;
    pubKeyEncoded: string;
    secretKey: Uint8Array;
    secretKeyEncoded: string;
    constructor(seed: string);
}
export declare class VelasNative {
    rpcURL: string;
    connection: Connection | undefined;
    constructor(rpcURL?: string);
    private establishConnection;
    createAccount(): AccountObj;
    test(): Promise<void>;
    getBalance(account: string | PublicKey): Promise<{
        lamports: number;
        VLX: number;
    }>;
    getStakeAccount(address: string): Promise<StakeActivationData>;
    getKeysFromSeed(seedPhrase: string): Promise<void>;
    getConfirmedBlock(slot: number): Promise<ConfirmedBlock>;
    getNonce(nonceAccount: string | PublicKey): Promise<import("@velas/web3").NonceAccount | null>;
    getAccountInfo(publicKey: PublicKey): Promise<import("@velas/web3").AccountInfo<Buffer> | null>;
    getEpochInfo(): Promise<import("@velas/web3").EpochInfo>;
    getSlot(): Promise<number>;
    getSupply(): Promise<void>;
    getTransaction(signature: string): Promise<import("@velas/web3").ConfirmedTransaction | null>;
    /***
     * waitTime in seconds
     */
    waitForConfirmedTransaction(signature: string, waitTime?: number): Promise<import("@velas/web3").ConfirmedTransaction>;
    getTransactionConfirmationStatus(signature: string): Promise<import("@velas/web3").TransactionConfirmationStatus | undefined>;
    /***
     * waitTime in seconds
     */
    waitForFinalizedTransaction(signature: string, waitTime?: number): Promise<void>;
    transfer(params: {
        payerSeed: string;
        toAddress: string;
        lamports: number;
    }, instructionData?: {
        keys: AccountMeta[];
        programID: string;
        data: string;
    }): Promise<string>;
    replenish(toAddress: string, lamports: number, waitForFinalized?: boolean): Promise<void>;
}
export declare const velasNative: VelasNative;
export {};
