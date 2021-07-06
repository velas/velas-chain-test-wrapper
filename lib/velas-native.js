"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.velasNative = exports.VelasNative = void 0;
const solana_web3_1 = require("@velas/solana-web3");
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const logger_1 = require("./logger");
const helpers_1 = require("./helpers");
class AccountObj {
    constructor(seed) {
        this.seed = seed;
        this.bufferedSeed = Buffer.from(seed);
        this.keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(this.bufferedSeed.slice(0, 32));
        this.secretKey = this.keyPair.secretKey;
        this.pubKey = this.keyPair.publicKey;
        // const pubKey = bs58.encode(keyPair.publicKey);
        this.account = new solana_web3_1.Account(this.secretKey);
    }
}
class VelasNative {
    async establishConnection() {
        const rpcUrl = 'https://api.testnet.velas.com';
        this.connection = new solana_web3_1.Connection(rpcUrl, 'confirmed');
        const version = await this.connection.getVersion();
        logger_1.log.info('Connection to cluster established:', rpcUrl, version);
    }
    async getBalance(account) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        let publicKey = typeof account === 'string' ? new solana_web3_1.PublicKey(account) : account;
        const lamports = await this.connection.getBalance(publicKey);
        const VLXAmount = lamports / 10 ** 9;
        logger_1.log.info(`Balance: ${VLXAmount} VLX`);
        return { lamports, VLX: VLXAmount };
    }
    async getConfirmedBlock(slot) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const block = await this.connection.getConfirmedBlock(slot);
        logger_1.log.info(block);
        return block;
    }
    async getNonce(nonceAccount) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        let publicKey = typeof nonceAccount === 'string' ? new solana_web3_1.PublicKey(nonceAccount) : nonceAccount;
        const nonceAcc = await this.connection.getNonce(publicKey);
        logger_1.log.info(nonceAcc);
        return nonceAcc;
    }
    async getAccountInfo(publicKey) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const accInfo = await this.connection.getAccountInfo(publicKey);
        logger_1.log.info(accInfo);
        return accInfo;
    }
    async getEpochInfo() {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const epochInfo = await this.connection.getEpochInfo();
        logger_1.log.info(epochInfo);
        return epochInfo;
    }
    async getSlot() {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const slot = await this.connection.getSlot();
        logger_1.log.info(slot);
        return slot;
    }
    async getSupply() {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const supplyInfo = await this.connection.getSupply();
        logger_1.log.info(`Total supply: ${(supplyInfo.value.total / 10 ** 9).toFixed(0)} VLX`);
    }
    async getTransaction(signature) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        let transaction = await this.connection.getConfirmedTransaction(signature);
        if (transaction?.meta?.err)
            logger_1.log.warn(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
        if (!transaction)
            logger_1.log.warn(`No confirmed transaction with signature ${signature}`);
        // log.info(transaction?.meta?.logMessages?.join('').includes('Succeed'));
        return transaction;
    }
    /***
     * waitTime in seconds
     */
    async waitForConfirmedTransaction(signature, waitTime = 30) {
        let transaction = await this.connection.getConfirmedTransaction(signature);
        let transactionConfirmationTime = 0;
        while (!transaction && transactionConfirmationTime <= waitTime) {
            transactionConfirmationTime++;
            await helpers_1.helpers.sleep(1);
            transaction = await this.connection.getConfirmedTransaction(signature);
        }
        logger_1.log.info(`Transaction was confirmed in ${transactionConfirmationTime} seconds`);
        if (transaction?.meta?.err)
            logger_1.log.warn(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
        if (!transaction)
            logger_1.log.warn(`No confirmed transaction with signature ${signature}`);
        return transaction;
    }
    async transfer(params) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const payer = new AccountObj(params.payerSeed);
        const recepientPubKey = new solana_web3_1.PublicKey(params.toAddress);
        const transactionInsctruction = solana_web3_1.SystemProgram.transfer({
            fromPubkey: new solana_web3_1.PublicKey(payer.pubKey),
            toPubkey: recepientPubKey,
            lamports: params.lamports,
        });
        const { blockhash: recentBlockhash } = await this.connection.getRecentBlockhash();
        const tx = new solana_web3_1.Transaction({ recentBlockhash, feePayer: new solana_web3_1.PublicKey(payer.pubKey) }).add(transactionInsctruction);
        tx.sign(payer.account);
        const transactionId = await solana_web3_1.sendAndConfirmRawTransaction(this.connection, tx.serialize(), {
            commitment: 'single',
            skipPreflight: true,
        });
        logger_1.log.info('Transaction ID:', transactionId);
        return transactionId;
    }
}
exports.VelasNative = VelasNative;
exports.velasNative = new VelasNative();
(async () => {
    // await velasWeb3.getTransaction('6pYCFnhaMd8eZAQWT5aM1GaY75yUq6bVE7houhU9jnTKufBVb3uomzkEY2t7jRFSACn8D94rG3XgP2pos9FZXo7');
    // await transfer();
    // await velasWeb3.getEpochInfo();
    // await velasNative.getEpochInfo();
    // const slot = await velasNative.getSlot();
    // log.info(slot);
    // await velasNative.getConfirmedBlock(14641594);
    // await getSupply();
    // await getAccountInfo(new PublicKey('9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC'));
    // await velasNative.getBalance('');
    // await velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb');
    // const transactionID = await velasNative.transfer({ payerSeed: testData.payer.seed, toAddress: '', lamports: 13000000000 });
    // await velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb');
    // console.log(await velasNative.waitForConfirmedTransaction(transactionID));
    // await velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq');
    // log.error(await velasNative.connection?.getEpochSchedule());
    // const newAcc = new AccountObj('delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below');
    // console.log(bs58.encode(newAcc.pubKey));
})();
//# sourceMappingURL=velas-native.js.map