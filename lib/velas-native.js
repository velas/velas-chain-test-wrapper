"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
const web3_1 = require("@velas/web3");
const bip39 = __importStar(require("bip39"));
const bs58_1 = __importDefault(require("bs58"));
const ed25519 = __importStar(require("ed25519-hd-key"));
const tweetnacl_1 = __importDefault(require("tweetnacl"));
const web3_2 = __importDefault(require("web3"));
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
        this.account = new web3_1.Account(this.secretKey);
    }
}
class VelasNative {
    rpcURL;
    connection;
    constructor(rpcURL = 'https://api.testnet.velas.com') {
        this.rpcURL = rpcURL;
    }
    ;
    async establishConnection() {
        let connected = false;
        while (!connected) {
            try {
                this.connection = new web3_1.Connection(this.rpcURL, 'confirmed');
                const version = await this.connection.getVersion();
                if (!version)
                    throw new Error(`Cannot get version`);
                logger_1.log.debug('Connection to cluster established:', this.rpcURL, version);
                connected = true;
            }
            catch {
                logger_1.log.warn('Cannot establish connection to web3. Retry...');
                await helpers_1.helpers.sleep(1000);
            }
        }
        if (!this.connection)
            throw new Error(`Cannot establish connection to web3`);
        return this.connection;
    }
    createAccount() {
        const generatedMnemonic = bip39.generateMnemonic();
        return new AccountObj(generatedMnemonic);
    }
    async test() {
        console.log('test');
    }
    async getBalance(account) {
        const connection = await this.establishConnection();
        let publicKey = typeof account === 'string' ? new web3_1.PublicKey(account) : account;
        const lamports = await connection.getBalance(publicKey);
        const VLXAmount = lamports / 10 ** 9;
        logger_1.log.info(`- - - - - - - - - - - - - - - - - - - - - - - - `);
        logger_1.log.info(`Balance: ${VLXAmount} VLX`);
        logger_1.log.info(`- - - - - - - - - - - - - - - - - - - - - - - - `);
        return { lamports, VLX: VLXAmount };
    }
    async getStakeAccount(address) {
        const connection = await this.establishConnection();
        const stakeAccountPubKey = new web3_1.PublicKey(address);
        return await connection.getStakeActivation(stakeAccountPubKey);
    }
    // TODO
    async getKeysFromSeed(seedPhrase) {
        function deriveSeed(seed) {
            const derivationPath = "m/44'/5655640'/0'/0'";
            // derivedSeed = bip32.fromSeed(seed).derivePath("m/44'/5655640'/" + index + "'/0").privateKey;
            return ed25519.derivePath(derivationPath, seed).key;
        }
        const seed = await bip39.mnemonicToSeed(seedPhrase);
        const seedHex = seed.slice(0, 32).toString('hex');
        const derivedSeed = deriveSeed(seedHex);
        // const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
        const keyPair = tweetnacl_1.default.sign.keyPair.fromSeed(derivedSeed);
        const address = bs58_1.default.encode(keyPair.publicKey);
        const privateKey = bs58_1.default.encode(keyPair.secretKey);
        logger_1.log.info(address);
        logger_1.log.info(privateKey);
        // log.warn(address, privateKey);
        // this code generates random seed
        // const mnemonicForNewOpKey = bip39.generateMnemonic();
        // const seedForNewOpKey = await bip39.mnemonicToSeed(mnemonicForNewOpKey);
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
    //   const authorized = new Authorized(new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'), new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'));
    //   const stakeAccount = StakeProgram.createAccount({
    //     authorized,
    //     fromPubkey: new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'),
    //     lamports: 2000000000,
    //     stakePubkey: new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'),
    //   });
    //   // const stakeAccountPubKey = new PublicKey(address);
    //   const stakePubkey = await PublicKey.createWithSeed(
    //     new PublicKey('D25HT9pVmScZjz3DfNUFRb6Ci786DxSsjqyEYGA7nm1f'),
    //     1.toString(),
    //     StakeProgram.programId,
    //   );
    //   return await this.connection.getStakeActivation(stakeAccountPubKey);
    // }
    // TODO
    // private async closeConnection(): Promise<Connection> {
    //   if (!this.connection) throw new Error(`Cannot establish connection to web3`);
    //   return this.connection;
    // }
    // async getNextSeed() {
    //   const fromPubkey = this.getAccountPublicKey();
    //   for (let i = 0; i < 1000; i++) {
    //     const stakeAccountWithSeed = await PublicKey.createWithSeed(
    //       fromPubkey,
    //       i.toString(),
    //       StakeProgram.programId,
    //     );
    //     if (this.accounts.filter(item => { return item.address === stakeAccountWithSeed.toBase58() }).length === 0) {
    //       return i.toString();
    //     };
    //   };
    // };
    // async createAccount(amount_sol = (this.min_stake * this.sol)) {
    //   // check balance and amount
    //   const transaction = new Transaction();
    //   try {
    //     const rent = await this.connection.getMinimumBalanceForRentExemption(200);
    //     const fromPubkey = this.getAccountPublicKey();
    //     const authorized = new Authorized(fromPubkey, fromPubkey);
    //     const lamports = amount_sol + rent;
    //     const seed = await this.getNextSeed();
    //     const stakeAccountWithSeed = await PublicKey.createWithSeed(
    //       fromPubkey,
    //       seed,
    //       StakeProgram.programId,
    //     );
    //     const lockup = new Lockup(0, 0, fromPubkey);
    //     const config = {
    //       authorized,
    //       basePubkey: fromPubkey,
    //       fromPubkey,
    //       lamports,
    //       lockup,
    //       seed,
    //       stakePubkey: stakeAccountWithSeed,
    //     };
    //     transaction.add(StakeProgram.createAccountWithSeed(config));
    //   } catch (e) {
    //     return {
    //       error: "prepare_transaction_error",
    //       description: e.message,
    //     };
    //   };
    //   return this.sendTransaction(transaction);
    // };
    // lockup: {
    //   unixTimestamp: lockup.unixTimestamp,
    //   epoch: lockup.epoch,
    //   custodian: lockup.custodian.toBuffer()
    // }
    // static createAccount(params) {
    //   const transaction = new Transaction();
    //   transaction.add(SystemProgram.createAccount({
    //     fromPubkey: params.fromPubkey,
    //     newAccountPubkey: params.stakePubkey,
    //     lamports: params.lamports,
    //     space: this.space,
    //     programId: this.programId
    //   }));
    //   const {
    //     stakePubkey,
    //     authorized,
    //     lockup
    //   } = params;
    //   return transaction.add(this.initialize({
    //     stakePubkey,
    //     authorized,
    //     lockup
    //   }));
    async getConfirmedBlock(slot) {
        const connection = await this.establishConnection();
        const block = await connection.getConfirmedBlock(slot);
        logger_1.log.info(block);
        return block;
    }
    async getNonce(nonceAccount) {
        const connection = await this.establishConnection();
        let publicKey = typeof nonceAccount === 'string' ? new web3_1.PublicKey(nonceAccount) : nonceAccount;
        const nonceAcc = await connection.getNonce(publicKey);
        logger_1.log.info(nonceAcc);
        return nonceAcc;
    }
    async getAccountInfo(publicKey) {
        const connection = await this.establishConnection();
        const accInfo = await connection.getAccountInfo(publicKey);
        logger_1.log.info(accInfo);
        return accInfo;
    }
    async getEpochInfo() {
        const connection = await this.establishConnection();
        const epochInfo = await connection.getEpochInfo();
        logger_1.log.info(epochInfo);
        return epochInfo;
    }
    async getSlot() {
        const connection = await this.establishConnection();
        const slot = await connection.getSlot();
        logger_1.log.info(slot);
        return slot;
    }
    async getSupply() {
        const connection = await this.establishConnection();
        const supplyInfo = await connection.getSupply();
        logger_1.log.info(`Total supply: ${(supplyInfo.value.total / 10 ** 9).toFixed(0)} VLX`);
    }
    async getTransaction(signature) {
        const connection = await this.establishConnection();
        let transaction = await connection.getConfirmedTransaction(signature);
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
        const connection = await this.establishConnection();
        let transaction = await connection.getConfirmedTransaction(signature);
        let transactionConfirmationTime = 0;
        while (!transaction && transactionConfirmationTime <= waitTime) {
            transactionConfirmationTime++;
            await helpers_1.helpers.sleep(1000);
            transaction = await connection.getConfirmedTransaction(signature);
        }
        logger_1.log.info(`Transaction was confirmed in ${transactionConfirmationTime} seconds`);
        if (transaction?.meta?.err)
            throw new Error(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
        if (!transaction)
            throw new Error(`No confirmed transaction with signature ${signature}`);
        return transaction;
    }
    async getTransactionConfirmationStatus(signature) {
        const connection = await this.establishConnection();
        const transaction = await connection.getSignatureStatus(signature);
        if (!transaction) {
            throw new Error(`Transaction ${signature} doesn\'t exist`);
        }
        return await transaction.value?.confirmationStatus;
    }
    /***
     * waitTime in seconds
     */
    async waitForFinalizedTransaction(signature, waitAfterConfirmed = 30) {
        await this.waitForConfirmedTransaction(signature);
        let status = await this.getTransactionConfirmationStatus(signature);
        let transactionFinalizationTime = 0;
        while (status !== 'finalized' && transactionFinalizationTime <= waitAfterConfirmed) {
            transactionFinalizationTime++;
            await helpers_1.helpers.sleep(1000);
            status = await this.getTransactionConfirmationStatus(signature);
        }
        if (status !== 'finalized') {
            throw new Error(`Transaction ${signature} was not finalized`);
        }
        logger_1.log.info(`Transaction ${signature} was finalized`);
    }
    async transfer(params, instructionData) {
        const connection = await this.establishConnection();
        const payer = new AccountObj(params.payerSeed);
        const recepientPubKey = new web3_1.PublicKey(params.toAddress);
        const transactionInsctruction = web3_1.SystemProgram.transfer({
            fromPubkey: new web3_1.PublicKey(payer.pubKey),
            toPubkey: recepientPubKey,
            lamports: params.lamports,
        });
        const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();
        const tx = new web3_1.Transaction({ recentBlockhash, feePayer: new web3_1.PublicKey(payer.pubKey) }).add(transactionInsctruction);
        if (instructionData) {
            const instruction = new web3_1.TransactionInstruction({
                keys: instructionData?.keys,
                programId: new web3_1.PublicKey(instructionData?.programID),
                data: Buffer.from(instructionData?.data),
            });
            tx.add(instruction);
        }
        tx.sign(payer.account);
        const transactionId = await (0, web3_1.sendAndConfirmRawTransaction)(connection, tx.serialize(), {
            commitment: 'single',
            skipPreflight: true,
        });
        logger_1.log.info('Transaction ID:', transactionId);
        if (!transactionId)
            throw new Error('Transaction failed');
        return transactionId;
    }
    /**
     *
     * @param payerPrivateKey
     * @param to
     * @param value
     * @param params payerAddress is optional but required to calculate nonce;
     * if you plan to sent several transactions in a row, please pass this param,
     * in other case some transactions may be failed;
     */
    async transferEVM(to, value, params) {
        if (params?.units === 'ether')
            value = value * 10 ** 18;
        const payerPrivateKey = params?.payerPrivateKey || process.env.VLX_EVM_PRIVATE_KEY;
        if (!payerPrivateKey)
            throw new Error(`No payer key. Pass as param or env variable`);
        // reserve endpoint https://testnet.velas.com/rpc
        const web3 = new web3_2.default(new web3_2.default.providers.HttpProvider(this.rpcURL));
        const MAX_AMOUNT_TO_BE_SENT = 1 * 10 ** 18;
        if (value > MAX_AMOUNT_TO_BE_SENT && !params?.approveLargeAmountTransfer) {
            throw new Error(`You try to send ${MAX_AMOUNT_TO_BE_SENT / 10 ** 18} VLX EVM tokens.
      Such big amount spendings are prevented. Please pass "approveLargeAmountTransfer" param with "true" value.`);
        }
        const transaction = {
            to,
            value,
            gas: 30000,
        };
        if (params?.payerAddress) {
            const nonce = await web3.eth.getTransactionCount(params?.payerAddress, 'latest');
            transaction.nonce = nonce;
            logger_1.log.debug('nonce:', nonce);
        }
        const signedTx = await web3.eth.accounts.signTransaction(transaction, payerPrivateKey);
        await web3.eth.sendSignedTransaction(signedTx.rawTransaction, function (error, hash) {
            if (error) {
                throw new Error(`Send EVM tx failed: ${error}`);
            }
            logger_1.log.info(`Successfully sent ${value / 10 ** 18} VLX EVM tokens to ${to}. Tx hash: ${hash}`);
        });
    }
    async replenish(toAddress, lamports, waitForFinalized) {
        if (lamports > 100 * 10 ** 9)
            throw new Error(`You try to replenish wallet with too much funds. Please use <100 VLX`);
        await this.establishConnection();
        const tx = await this.transfer({
            payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
            lamports,
            toAddress,
        });
        if (waitForFinalized) {
            await this.waitForFinalizedTransaction(tx);
        }
        else {
            await this.waitForConfirmedTransaction(tx);
        }
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
// (async () => {
// const velasNative = new VelasNative();
// const hash = await velasNative.transfer(
//   {
// payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
//     toAddress: 'Dawj15q13fqzh4baHqmD2kbrRCyiFfkE6gkPcUZ21KUS',
//     lamports: 0.0013 * 10 ** 9
//   }, {
//   keys: [],
//   programID: 'GW5kcMNyviBQkU8hxPBSYY2BfAhXbkAraEZsMRLE36ak',
//   data: '8d2042bd-22b3-4dcb-b596-713d87d728f1',
// });
// const tx = await velasNative.getTransaction('4wE4bCGTbjTg8KSTtCqvU4gWzhKjqWv97pa62sdc6vry5nEeEcFTE3VRYqZ4Po8F5JNTBxtuySqhwYWpCTQPBvdP');
// console.log(tx);
// console.log(velasNative.getBalance('G3bCTXjguwwiMBaVknjKooVjVCZqd1ZoobN6a8GNfkMz'));
// console.log(await velasNative.getBalance('G3bCTXjguwwiMBaVknjKooVjVCZqd1ZoobN6a8GNfkMz'));
// })();
// indicate swift danger law anchor snack guilt endless harbor stock involve toy
//# sourceMappingURL=velas-native.js.map