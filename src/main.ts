import {
  Connection,
  PublicKey
} from '@velas/solana-web3';
// import base58 from 'bs58';
import { log } from '../logger';

let connection: Connection;

async function establishConnection(): Promise<void> {
  const rpcUrl = 'https://api.testnet.velas.com';
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

async function getBalance() {
  const publicKey = new PublicKey('EcC91Vj9AB8PqryPjHmS6w55M6fHrRA7sRzzwbYgiCoX');

  if (!connection) await establishConnection();

  const lamports = await connection.getBalance(publicKey);
  log.info(`Balance: ${lamports / 10 ** 9} VLX`);
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

(async () => {
  // await getBalance();
  await getTransaction();

})();
