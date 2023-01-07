import {
  Account, AccountMeta, Authorized, ConfirmedBlock, Connection, PublicKey,
  sendAndConfirmRawTransaction,
  StakeActivationData,
  StakeProgram,
  SystemProgram, Transaction, TransactionInstruction
} from '@velas/web3';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
import * as ed25519 from 'ed25519-hd-key';
import nacl from 'tweetnacl';
import { helpers } from './helpers';
import { log } from './logger';

class AccountObj {
  account;
  bufferedSeed;
  keyPair;
  pubKey;
  pubKeyEncoded;
  secretKey;
  secretKeyEncoded;

  constructor(public seed: string) {
    this.bufferedSeed = Buffer.from(seed);
    this.keyPair = nacl.sign.keyPair.fromSeed(this.bufferedSeed.slice(0, 32));
    this.secretKey = this.keyPair.secretKey;
    this.pubKey = this.keyPair.publicKey;
    this.pubKeyEncoded = bs58.encode(this.pubKey);
    this.secretKeyEncoded = bs58.encode(this.secretKey);
    // const pubKey = bs58.encode(keyPair.publicKey);
    this.account = new Account(this.secretKey);
  }
}

export class VelasNative {
  connection: Connection | undefined;

  constructor(public rpcURL = 'https://api.testnet.velas.com') { };

  private async establishConnection(): Promise<Connection> {
    let connected = false;
    while (!connected) {
      try {
        this.connection = new Connection(this.rpcURL, 'confirmed');
        const version = await this.connection.getVersion();
        if (!version) throw new Error(`Cannot get version`);
        log.debug('Connection to cluster established:', this.rpcURL, version);
        connected = true;
      } catch {
        log.warn('Cannot establish connection to web3. Retry...');
        await helpers.sleep(1000);
      }
    }
    if (!this.connection) throw new Error(`Cannot establish connection to web3`);
    return this.connection;
  }

  createAccount(): AccountObj {
    const generatedMnemonic = bip39.generateMnemonic();
    return new AccountObj(generatedMnemonic);
  }

  async test() {
    console.log('test');
  }

  async getBalance(account: string | PublicKey): Promise<{ lamports: number, VLX: number }> {
    const connection = await this.establishConnection();

    let publicKey = typeof account === 'string' ? new PublicKey(account) : account;
    const lamports = await connection.getBalance(publicKey);
    const VLXAmount = lamports / 10 ** 9;
    log.info(`- - - - - - - - - - - - - - - - - - - - - - - - `);
    log.info(`Balance: ${VLXAmount} VLX`);
    log.info(`- - - - - - - - - - - - - - - - - - - - - - - - `);
    return { lamports, VLX: VLXAmount };
  }

  async getStakeAccount(address: string): Promise<StakeActivationData> {
    const connection = await this.establishConnection();

    const stakeAccountPubKey = new PublicKey(address);
    return await connection.getStakeActivation(stakeAccountPubKey);
  }

  // TODO
  async getKeysFromSeed(seedPhrase: string) {

    function deriveSeed(seed: string) {
      const derivationPath = "m/44'/5655640'/0'/0'";
      // derivedSeed = bip32.fromSeed(seed).derivePath("m/44'/5655640'/" + index + "'/0").privateKey;

      return ed25519.derivePath(derivationPath, seed).key;
    }

    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const seedHex = seed.slice(0, 32).toString('hex');
    const derivedSeed = deriveSeed(seedHex);

    // const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));
    const keyPair = nacl.sign.keyPair.fromSeed(derivedSeed);

    const address = bs58.encode(keyPair.publicKey);
    const privateKey = bs58.encode(keyPair.secretKey);

    log.info(address);
    log.info(privateKey);
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




  async getConfirmedBlock(slot: number): Promise<ConfirmedBlock> {
    const connection = await this.establishConnection();

    const block = await connection.getConfirmedBlock(slot);
    log.info(block);
    return block;
  }

  async getNonce(nonceAccount: string | PublicKey) {
    const connection = await this.establishConnection();

    let publicKey = typeof nonceAccount === 'string' ? new PublicKey(nonceAccount) : nonceAccount;
    const nonceAcc = await connection.getNonce(publicKey);
    log.info(nonceAcc);
    return nonceAcc;
  }

  async getAccountInfo(publicKey: PublicKey) {
    const connection = await this.establishConnection();

    const accInfo = await connection.getAccountInfo(publicKey);
    log.info(accInfo);
    return accInfo;
  }

  async getEpochInfo() {
    const connection = await this.establishConnection();

    const epochInfo = await connection.getEpochInfo();
    log.info(epochInfo);
    return epochInfo;
  }

  async getSlot() {
    const connection = await this.establishConnection();

    const slot = await connection.getSlot();
    log.info(slot);
    return slot;
  }

  async getSupply() {
    const connection = await this.establishConnection();

    const supplyInfo = await connection.getSupply();
    log.info(`Total supply: ${(supplyInfo.value.total / 10 ** 9).toFixed(0)} VLX`);
  }

  async getTransaction(signature: string) {
    const connection = await this.establishConnection();

    let transaction = await connection.getConfirmedTransaction(signature);

    if (transaction?.meta?.err) log.warn(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
    if (!transaction) log.warn(`No confirmed transaction with signature ${signature}`);
    // log.info(transaction?.meta?.logMessages?.join('').includes('Succeed'));
    return transaction;
  }

  /***
   * waitTime in seconds
   */
  async waitForConfirmedTransaction(signature: string, waitTime = 30) {
    const connection = await this.establishConnection();

    let transaction = await connection.getConfirmedTransaction(signature);

    let transactionConfirmationTime = 0;
    while (!transaction && transactionConfirmationTime <= waitTime) {
      transactionConfirmationTime++;
      await helpers.sleep(1000);
      transaction = await connection.getConfirmedTransaction(signature);
    }

    log.info(`Transaction was confirmed in ${transactionConfirmationTime} seconds`);
    if (transaction?.meta?.err) throw new Error(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
    if (!transaction) throw new Error(`No confirmed transaction with signature ${signature}`);
    return transaction;
  }

  async getTransactionConfirmationStatus(signature: string) {
    const connection = await this.establishConnection();
    let transaction = await connection.getSignatureStatus(signature);
    if (!transaction) {
      throw new Error(`Transaction ${signature} doesn\'t exist`);
    }
    return await transaction.value?.confirmationStatus;
  }

  /***
   * waitTime in seconds
   */
  async waitForFinalizedTransaction(signature: string, waitTime = 30) {
    await this.waitForConfirmedTransaction(signature);

    let status = await this.getTransactionConfirmationStatus(signature);
    let transactionFinalizationTime = 0;
    while (status !== 'finalized' && transactionFinalizationTime <= waitTime) {
      transactionFinalizationTime++;
      await helpers.sleep(1000);
      status = await this.getTransactionConfirmationStatus(signature);
    }
    if (status !== 'finalized'){
      throw new Error(`Transaction ${signature} was not finalized`);
    }
    log.info(`Transaction ${signature} successfully finalized`);
  }

  async transfer(params: {
    payerSeed: string,
    toAddress: string,
    lamports: number,
  }, instructionData?: {
    keys: AccountMeta[],
    programID: string,
    data: string,
  }): Promise<string> {
    const connection = await this.establishConnection();

    const payer = new AccountObj(params.payerSeed);
    const recepientPubKey = new PublicKey(params.toAddress);

    const transactionInsctruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(payer.pubKey),
      toPubkey: recepientPubKey,
      lamports: params.lamports,
    });

    const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();
    const tx = new Transaction({ recentBlockhash, feePayer: new PublicKey(payer.pubKey) }).add(transactionInsctruction);

    if (instructionData) {
      const instruction = new TransactionInstruction({
        keys: instructionData?.keys,
        programId: new PublicKey(instructionData?.programID),
        data: Buffer.from(instructionData?.data),
      });
      tx.add(instruction);
    }

    tx.sign(payer.account);

    const transactionId = await sendAndConfirmRawTransaction(
      connection,
      tx.serialize(),
      {
        commitment: 'single',
        skipPreflight: true,
      }
    );

    log.info('Transaction ID:', transactionId);
    if (!transactionId) throw new Error('Transaction failed');
    return transactionId;
  }

  async replenish(toAddress: string, lamports: number, waitForFinalized?: boolean): Promise<void> {
    if (lamports > 100 * 10 ** 9) throw new Error(`You try to replenish wallet with too much funds. Please use <100 VLX`);

    await this.establishConnection();

    const tx = await this.transfer({
      payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
      lamports,
      toAddress,
    });
    await this.waitForConfirmedTransaction(tx);
    if (waitForFinalized){
      await this.waitForFinalizedTransaction(tx);
    }
  }
}

export const velasNative = new VelasNative();

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
//   const velasNative = new VelasNative();
//   const hash = await velasNative.transfer(
//     {
//       payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
//       toAddress: 'Dawj15q13fqzh4baHqmD2kbrRCyiFfkE6gkPcUZ21KUS',
//       lamports: 0.0013 * 10 ** 9
//     }, {
//     keys: [],
//     programID: 'GW5kcMNyviBQkU8hxPBSYY2BfAhXbkAraEZsMRLE36ak',
//     data: '8d2042bd-22b3-4dcb-b596-713d87d728f1',
//   });

//   // const tx = await velasNative.getTransaction('4wE4bCGTbjTg8KSTtCqvU4gWzhKjqWv97pa62sdc6vry5nEeEcFTE3VRYqZ4Po8F5JNTBxtuySqhwYWpCTQPBvdP');
//   // console.log(tx);
//   // console.log(velasNative.getBalance('G3bCTXjguwwiMBaVknjKooVjVCZqd1ZoobN6a8GNfkMz'));

//   // console.log(await velasNative.getBalance('G3bCTXjguwwiMBaVknjKooVjVCZqd1ZoobN6a8GNfkMz'));
// })();


// indicate swift danger law anchor snack guilt endless harbor stock involve toy