import {
  Account, AccountMeta, ConfirmedBlock,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  StakeActivationData,
  SystemProgram,
  Transaction, TransactionInstruction
} from '@velas/solana-web3';
import * as bip39 from 'bip39';
import bs58 from 'bs58';
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

  private async establishConnection(): Promise<void> {
    const rpcUrl = 'https://api.testnet.velas.com';
    this.connection = new Connection(rpcUrl, 'confirmed');
    const version = await this.connection.getVersion();
    log.debug('Connection to cluster established:', rpcUrl, version);
  }

  createAccount(): AccountObj {
    const generatedMnemonic = bip39.generateMnemonic();
    return new AccountObj(generatedMnemonic);
  }

  async getBalance(account: string | PublicKey): Promise<{ lamports: number, VLX: number }> {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    let publicKey = typeof account === 'string' ? new PublicKey(account) : account;
    const lamports = await this.connection.getBalance(publicKey);
    const VLXAmount = lamports / 10 ** 9;
    log.info(`Balance: ${VLXAmount} VLX`);
    return { lamports, VLX: VLXAmount };
  }

  async getStakeAccount(address: string): Promise<StakeActivationData> {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const stakeAccountPubKey = new PublicKey(address);
    return await this.connection.getStakeActivation(stakeAccountPubKey);
  }

  async getKeysFromSeed(seedPhrase: string) {
    const seed = await bip39.mnemonicToSeed(seedPhrase);
    const keyPair = nacl.sign.keyPair.fromSeed(seed.slice(0, 32));

    const address = bs58.encode(keyPair.publicKey);
    const privateKey = bs58.encode(keyPair.secretKey);

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

  async getConfirmedBlock(slot: number): Promise<ConfirmedBlock> {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const block = await this.connection.getConfirmedBlock(slot);
    log.info(block);
    return block;
  }

  async getNonce(nonceAccount: string | PublicKey) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    let publicKey = typeof nonceAccount === 'string' ? new PublicKey(nonceAccount) : nonceAccount;
    const nonceAcc = await this.connection.getNonce(publicKey);
    log.info(nonceAcc);
    return nonceAcc;
  }

  async getAccountInfo(publicKey: PublicKey) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const accInfo = await this.connection.getAccountInfo(publicKey);
    log.info(accInfo);
    return accInfo;
  }

  async getEpochInfo() {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const epochInfo = await this.connection.getEpochInfo();
    log.info(epochInfo);
    return epochInfo;
  }

  async getSlot() {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const slot = await this.connection.getSlot();
    log.info(slot);
    return slot;
  }

  async getSupply() {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const supplyInfo = await this.connection.getSupply();
    log.info(`Total supply: ${(supplyInfo.value.total / 10 ** 9).toFixed(0)} VLX`);
  }

  async getTransaction(signature: string) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    let transaction = await this.connection.getConfirmedTransaction(signature);

    if (transaction?.meta?.err) log.warn(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
    if (!transaction) log.warn(`No confirmed transaction with signature ${signature}`);
    // log.info(transaction?.meta?.logMessages?.join('').includes('Succeed'));
    return transaction;
  }

  /***
   * waitTime in seconds
   */
  async waitForConfirmedTransaction(signature: string, waitTime = 30) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    let transaction = await this.connection!.getConfirmedTransaction(signature);

    let transactionConfirmationTime = 0;
    while (!transaction && transactionConfirmationTime <= waitTime) {
      transactionConfirmationTime++;
      await helpers.sleep(1);
      transaction = await this.connection.getConfirmedTransaction(signature);
    }

    log.info(`Transaction was confirmed in ${transactionConfirmationTime} seconds`);
    if (transaction?.meta?.err) throw new Error(`Transaction ${signature} has error\n${transaction?.meta?.err}`);
    if (!transaction) throw new Error(`No confirmed transaction with signature ${signature}`);
    return transaction;
  }

  async transfer(params: {
    payerSeed: string,
    toAddress: string,
    lamports: number
  }, instructionData?: {
    keys: AccountMeta[],
    programID: string,
    data: string,
  }): Promise<string> {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const payer = new AccountObj(params.payerSeed);
    const recepientPubKey = new PublicKey(params.toAddress);

    const transactionInsctruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(payer.pubKey),
      toPubkey: recepientPubKey,
      lamports: params.lamports,
    });

    const { blockhash: recentBlockhash } = await this.connection.getRecentBlockhash();
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
      this.connection,
      tx.serialize(),
      {
        commitment: 'single',
        skipPreflight: true,
      }
    );

    log.info('Transaction ID:', transactionId);
    return transactionId;
  }

  async replenish(toAddress: string, lamports: number): Promise<void> {
    if (lamports > 100 * 10 ** 9) throw new Error(`You try to replenish wallet with too much funds. Please use <100 VLX`);

    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const tx = await this.transfer({
      payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
      lamports,
      toAddress,
    });
    await this.waitForConfirmedTransaction(tx);
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
