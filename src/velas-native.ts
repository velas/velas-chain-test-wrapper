import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction
} from '@velas/solana-web3';
import nacl from 'tweetnacl';
import { log } from '../logger';

class Payer {
  account;
  bufferedSeed;
  keyPair;
  pubKey;
  secretKey;

  constructor(public seed: string) {
    this.bufferedSeed = Buffer.from(seed);
    this.keyPair = nacl.sign.keyPair.fromSeed(this.bufferedSeed.slice(0, 32));
    this.secretKey = this.keyPair.secretKey;
    this.pubKey = this.keyPair.publicKey;
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
    log.info('Connection to cluster established:', rpcUrl, version);
  }

  async getBalance(account: string | PublicKey) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    let publicKey = typeof account === 'string' ? new PublicKey(account) : account;
    const lamports = await this.connection.getBalance(publicKey);
    log.info(`Balance: ${lamports / 10 ** 9} VLX`);
  }

  async getConfirmedBlock(slot: number) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const block = await this.connection.getConfirmedBlock(slot);
    log.info(block);
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

    const transaction = await this.connection.getConfirmedTransaction(signature);
    if (transaction?.meta?.err) log.warn(`Transaction ${signature} has error\n${transaction?.meta?.err}`)
    // log.info(transaction?.meta?.logMessages?.join('').includes('Succeed'));
  }

  async transfer(params: { payerSeed: string, toAddress: string }) {
    if (!this.connection) {
      await this.establishConnection();
      if (!this.connection) throw new Error(`Cannot establish connection`);
    }

    const payer = new Payer(params.payerSeed);
    const recepientPubKey = new PublicKey(params.toAddress)

    const transactionInsctruction = SystemProgram.transfer({
      fromPubkey: new PublicKey(payer.pubKey),
      toPubkey: recepientPubKey,
      lamports: 10000000,
    });

    const { blockhash: recentBlockhash } = await this.connection.getRecentBlockhash();
    console.log(payer.account.publicKey.toBase58())
    const tx = new Transaction({ recentBlockhash, feePayer: new PublicKey(payer.pubKey) }).add(transactionInsctruction);
    tx.sign(payer.account);

    const transactionId = await sendAndConfirmRawTransaction(
      this.connection,
      tx.serialize(),
      {
        commitment: 'single',
        skipPreflight: true,
      }
    );

    console.log('- - - - - - - - - - - - -');
    console.log('Transaction ID:', transactionId);
    console.log('- - - - - - - - - - - - -');
  }

}

// const velasWeb3 = new VelasWeb3();

// (async () => {
//   // await velasWeb3.getBalance();
//   // await velasWeb3.getTransaction('6pYCFnhaMd8eZAQWT5aM1GaY75yUq6bVE7houhU9jnTKufBVb3uomzkEY2t7jRFSACn8D94rG3XgP2pos9FZXo7');
//   // await transfer();
//   // await velasWeb3.getEpochInfo();
//   await velasWeb3.getEpochInfo();
//   const slot = await velasWeb3.getSlot();
//   // log.info(slot);
//   await velasWeb3.getConfirmedBlock(14641594);
//   // await getSupply();
//   // await getAccountInfo(new PublicKey('9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC'));
//   // await velasWeb3.transfer({ payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below', toAddress: 'EcC91Vj9AB8PqryPjHmS6w55M6fHrRA7sRzzwbYgiCoX' });
// })();
