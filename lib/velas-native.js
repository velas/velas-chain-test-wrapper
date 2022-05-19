"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.velasNative = exports.VelasNative = void 0;
const solana_web3_1 = require("@velas/solana-web3");
const bip39 = __importStar(require("bip39"));
const bs58_1 = __importDefault(require("bs58"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const helpers_1 = require("./helpers");
const logger_1 = require("./logger");
class AccountObj {
    seed;
    account;
    bufferedSeed;
    keyPair;
    pubKey;
    pubKeyEncoded;
    secretKey;
    secretKeyEncoded;
    constructor(seed) {
        this.seed = seed;
        this.bufferedSeed = Buffer.from(seed);
        this.keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(this.bufferedSeed.slice(0, 32));
        this.secretKey = this.keyPair.secretKey;
        this.pubKey = this.keyPair.publicKey;
        this.pubKeyEncoded = bs58_1.default.encode(this.pubKey);
        this.secretKeyEncoded = bs58_1.default.encode(this.secretKey);
        // const pubKey = bs58.encode(keyPair.publicKey);
        this.account = new solana_web3_1.Account(this.secretKey);
    }
}
class VelasNative {
    connection;
    async establishConnection() {
        const rpcUrl = 'https://api.testnet.velas.com';
        this.connection = new solana_web3_1.Connection(rpcUrl, 'confirmed');
        const version = await this.connection.getVersion();
        logger_1.log.debug('Connection to cluster established:', rpcUrl, version);
    }
    createAccount() {
        const generatedMnemonic = bip39.generateMnemonic();
        return new AccountObj(generatedMnemonic);
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
    async getStakeAccount(address) {
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const stakeAccountPubKey = new solana_web3_1.PublicKey(address);
        return await this.connection.getStakeActivation(stakeAccountPubKey);
    }
    async getKeysFromSeed(seedPhrase) {
        const seed = await bip39.mnemonicToSeed(seedPhrase);
        const keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(seed.slice(0, 32));
        const address = bs58_1.default.encode(keyPair.publicKey);
        const privateKey = bs58_1.default.encode(keyPair.secretKey);
        // log.warn(address, privateKey);
        // this code generates random seed
        // const mnamonicForNewOpKey = bip39.generateMnemonic();
        // const seedForNewOpKey = await bip39.mnemonicToSeed(mnamonicForNewOpKey);
        // const keyPairOperational = nacl.sign.keyPair.fromSeed(seedForNewOpKey.slice(0, 32));
        // const pair = nacl.sign.keyPair();
        // const secret = bs58.encode(keyPairOperational.secretKey);
        // const op_key = bs58.encode(keyPairOperational.publicKey);
    }

    // async createStakeAccount(address: string): Promise<StakeActivationData> {
    //   if (!this.connection) {
    //     await this.establishConnection();
    //     if (!this.connection) throw new Error(`Cannot establish connection`);
    //   }
    //   const stakeAccount = StakeProgram.createAccount({
    //     authorized: {
    //       staker: new PublicKey(''),
    //       withdrawer: new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'),
    //     },
    //     fromPubkey: ,
    //     lamports: ,
    //     stakePubkey: ,
    //     lockup: ,
    //   })
    //   const stakeAccountPubKey = new PublicKey(address);
    //   return await this.connection.getStakeActivation(stakeAccountPubKey);
    // }
    
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
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        let transaction = await this.connection.getConfirmedTransaction(signature);
        let transactionConfirmationTime = 0;
        while (!transaction && transactionConfirmationTime <= waitTime) {
            transactionConfirmationTime++;
            await helpers_1.helpers.sleep(1);
            transaction = await this.connection.getConfirmedTransaction(signature);
        }
        logger_1.log.info(`Transaction was confirmed in ${transactionConfirmationTime} seconds`);
        if (transaction?.meta?.err)
            throw new Error(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
        if (!transaction)
            throw new Error(`No confirmed transaction with signature ${signature}`);
        return transaction;
    }
    async transfer(params, instructionData) {
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
        if (instructionData) {
            const instruction = new solana_web3_1.TransactionInstruction({
                keys: instructionData?.keys,
                programId: new solana_web3_1.PublicKey(instructionData?.programID),
                data: Buffer.from(instructionData?.data),
            });
            tx.add(instruction);
        }
        tx.sign(payer.account);
        const transactionId = await (0, solana_web3_1.sendAndConfirmRawTransaction)(this.connection, tx.serialize(), {
            commitment: 'single',
            skipPreflight: true,
        });
        logger_1.log.info('Transaction ID:', transactionId);
        return transactionId;
    }
    async replenish(toAddress, lamports) {
        if (lamports > 100 * 10 ** 9)
            throw new Error(`You try to replenish wallet with too much funds. Please use <100 VLX`);
        if (!this.connection) {
            await this.establishConnection();
            if (!this.connection)
                throw new Error(`Cannot establish connection`);
        }
        const tx = await this.transfer({
            payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
            lamports,
            toAddress,
        });
        await this.waitForConfirmedTransaction(tx);
    }
}
exports.VelasNative = VelasNative;
exports.velasNative = new VelasNative();
(async () => {
    // await velasWeb3.getTransaction('6pYCFnhaMd8eZAQWT5aM1GaY75yUq6bVE7houhU9jnTKufBVb3uomzkEY2t7jRFSACn8D94rG3XgP2pos9FZXo7');
    // await velasWeb3.getEpochInfo();
    // await velasNative.getEpochInfo();
    // const slot = await velasNative.getSlot();
    // log.info(slot);
    // await velasNative.getConfirmedBlock(14641594);
    // await getSupply();
    // await getAccountInfo(new PublicKey('9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC'));
    // await velasNative.getBalance('');
    // await velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb');
    // 2DKco1JBu1zshWDLmCp34AVgE6YkAu9BPmgbbgRuCoGm
    // const generatedMnemonic = bip39.generateMnemonic();
    // log.warn(generatedMnemonic);
    // const seed = await bip39.mnemonicToSeed(generatedMnemonic);
    // log.warn(seed);
    // const keyPairOperational = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    // const pair = nacl.sign.keyPair();
    // const secret = bs58.encode(keyPairOperational.secretKey);
    // const op_key = bs58.encode(keyPairOperational.publicKey);
    // log.info(secret);
    // log.info(op_key);
    // const acc = velasNative.createAccount();
    // await velasNative.replenish(acc.pubKeyEncoded, 10 ** 4);
    // // await velasNative.getBalance(acc.pubKeyEncoded);
    // // log.warn(acc.pubKeyEncoded);
    // await velasNative.transfer({payerSeed: acc.seed, toAddress: 'EcC91Vj9AB8PqryPjHmS6w55M6fHrRA7sRzzwbYgiCoX', lamports: 1});
    // log.warn(await velasNative.getBalance(acc.pubKeyEncoded));
    // const transactionID = await velasNative.transfer({
    //   payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
    //   toAddress: 'DAWxo9UT6jCfCWZSoJGaU14Fjjr5boCKyNe8J6SWmcTC',
    //   lamports: 501
    // }
    //   , {
    //     keys: [],
    //     programID: 'GW5kcMNyviBQkU8hxPBSYY2BfAhXbkAraEZsMRLE36ak',
    //     data: '62e828ba-80e5-4e9f-adce-8bb71ec8eeb6',
    //   }
    // );
    // log.warn(transactionID);
    // await velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb');
    // console.log(await velasNative.waitForConfirmedTransaction(transactionID));
    // await velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq');
    // log.error(await velasNative.connection?.getEpochSchedule());
    // const newAcc = new AccountObj('delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below');
    // console.log(bs58.encode(newAcc.pubKey));
    // log.warn(await velasNative.getStakeAccount('59vpQgPoDEhux1G84jk6dbbARQqfUwYtohLU4fgdxFKG'));
    // log.warn(await velasNative.smth('7YgtFNgGu42z5uyAWkjkBWaBVNuHMu7nMWtS8222SpXL'));
    // log.warn(await velasNative.getEpochInfo());
    // await velasNative.('2K1h1vHRXKeo5iNCYtP5wvFXdbvY6TWwSPUyi2ViXap23rWYJW1G8gce1JCGnqGzMqLTGpRhRFQwrF3DwyPT1oUH');
})();
//# sourceMappingURL=velas-native.js.map