import {
  Account,
  Connection,
  PublicKey,
  sendAndConfirmRawTransaction,
  SystemProgram,
  Transaction,
} from '@velas/solana-web3';
import nacl from 'tweetnacl';
import { log } from '../logger';


let connection: Connection;

async function establishConnection(): Promise<void> {
  const rpcUrl = 'https://api.testnet.velas.com';
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

async function getBalance() {
  const publicKey = new PublicKey('9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC');

  if (!connection) await establishConnection();

  const lamports = await connection.getBalance(publicKey);
  log.info(`Balance: ${lamports / 10 ** 9} VLX`);
}

async function getEpochInfo() {
  await establishConnection();
  const epochInfo = await connection.getEpochInfo();
  log.info(epochInfo);
}

async function getTransaction() {
  await establishConnection();
  const transaction = await connection.getConfirmedTransaction('6pYCFnhaMd8eZAQWT5aM1GaY75yUq6bVE7houhU9jnTKufBVb3uomzkEY2t7jRFSACn8D94rG3XgP2pos9FZXo7');
  // log.info(`Transaction:\n${JSON.stringify(transaction, null, 2)}`);
  // const buffer = transaction?.transaction.signatures[0].signature?.buffer as ArrayBufferLike;
  // log.warn(Buffer.from(buffer).toString());
  log.info(transaction?.meta?.err === null);
  log.info(transaction?.meta?.logMessages?.join('').includes('Succeed'));
}

async function transfer() {
  await establishConnection();

  const senderSeed = 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below';

  const bufferedSeed = Buffer.from(senderSeed);
  const keyPair = nacl.sign.keyPair.fromSeed(bufferedSeed.slice(0, 32));
  // const pubKey = bs58.encode(keyPair.publicKey);
  const secretKey = keyPair.secretKey;
  const pubKey = keyPair.publicKey;
  console.log(pubKey);

  const payerAccount = new Account(secretKey);


  const transactionInsctruction = SystemProgram.transfer({
    fromPubkey: new PublicKey(pubKey),
    // toPubkey: new PublicKey('7LG1MMms32y6z7a9DqAPEt7uxR3ZMLZiMyrkuMRd7aX8'),
    toPubkey: new PublicKey('EcC91Vj9AB8PqryPjHmS6w55M6fHrRA7sRzzwbYgiCoX'),
    lamports: 10000000,
  });

  const { blockhash: recentBlockhash } = await connection.getRecentBlockhash();
  console.log(payerAccount.publicKey.toBase58())
  const tx = new Transaction({ recentBlockhash, feePayer: new PublicKey('9kMFdW1VENdVpMyG9NNadNTzwXghknj3iU7CUwYFP1GC') }).add(transactionInsctruction);
  tx.sign(payerAccount);

  console.dir(tx, { depth: null })

  const transactionId = await sendAndConfirmRawTransaction(
    connection,
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

(async () => {
  // await getBalance();
  // await getTransaction();
  // await transfer();
  await getEpochInfo();
})();
