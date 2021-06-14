import {
  Connection,
  PublicKey
} from '@solana/web3.js';
import fs from 'mz/fs';
import os from 'os';
import path from 'path';
import yaml from 'yaml';
import { log } from '../logger';

let connection: Connection;
const publicKey = new PublicKey('EcC91Vj9AB8PqryPjHmS6w55M6fHrRA7sRzzwbYgiCoX');

async function getConfig(): Promise<any> {
  // Path to velas CLI config file
  const CONFIG_FILE_PATH = path.resolve(
    os.homedir(),
    '.config',
    'velas',
    'cli',
    'config.yml',
  );
  const configYml = await fs.readFile(CONFIG_FILE_PATH, { encoding: 'utf8' });
  return yaml.parse(configYml);
}

async function getRpcUrl(): Promise<string> {
  try {
    const config = await getConfig();
    if (!config.json_rpc_url) throw new Error('Missing RPC URL');
    return config.json_rpc_url;
  } catch (err) {
    console.warn(
      'Failed to read RPC url from CLI config file, falling back to localhost',
    );
    return 'http://localhost:8899';
  }
}

async function establishConnection(): Promise<void> {
  const rpcUrl = await getRpcUrl();
  connection = new Connection(rpcUrl, 'confirmed');
  const version = await connection.getVersion();
  console.log('Connection to cluster established:', rpcUrl, version);
}

async function main() {
  await establishConnection();

  const lamports = await connection.getBalance(publicKey);
  log.info(`Balance: ${lamports / 10 ** 9} VLX`);
}

(async () => {
  await main()
})();