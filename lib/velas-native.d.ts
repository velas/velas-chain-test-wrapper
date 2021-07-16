/// <reference types="node" />
import { ConfirmedBlock, Connection, PublicKey, StakeActivationData } from '@velas/solana-web3';
export declare class VelasNative {
    connection: Connection | undefined;
    private establishConnection;
    getBalance(account: string | PublicKey): Promise<{
        lamports: number;
        VLX: number;
    }>;
    getStakeAccount(account: string): Promise<StakeActivationData>;
    getConfirmedBlock(slot: number): Promise<ConfirmedBlock>;
    getNonce(nonceAccount: string | PublicKey): Promise<import("@velas/solana-web3").NonceAccount | null>;
    getAccountInfo(publicKey: PublicKey): Promise<import("@velas/solana-web3").AccountInfo<Buffer> | null>;
    getEpochInfo(): Promise<import("@velas/solana-web3").EpochInfo>;
    getSlot(): Promise<number>;
    getSupply(): Promise<void>;
    getTransaction(signature: string): Promise<import("@velas/solana-web3").ConfirmedTransaction | null>;
    /***
     * waitTime in seconds
     */
    waitForConfirmedTransaction(signature: string, waitTime?: number): Promise<import("@velas/solana-web3").ConfirmedTransaction | null>;
    transfer(params: {
        payerSeed: string;
        toAddress: string;
        lamports: number;
    }): Promise<string>;
}
export declare const velasNative: VelasNative;
