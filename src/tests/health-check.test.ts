import { log } from '../../logger';
import { assert } from '../assert';
import { velasNative } from '../velas-native';

describe('Health check', function () {
  // this.timeout(300000);

  it('Get epoch info', async function () {
    const epochInfo = await velasNative.getEpochInfo();
    assert.isAbove(epochInfo.epoch, 48);
  });

  xit('No skipped blocks', async function () {
    const slot = await velasNative.getSlot();
    const lastConfirmedBlock = slot - 100;
    // blocks in epoch – 432000
    for (let block = lastConfirmedBlock; block >= lastConfirmedBlock - 43; block--) {
      log.warn('block', block);
      await velasNative.getConfirmedBlock(block);
    }
  });


  it('Get account balance', async function () {
    assert.equal((await velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb')).VLX, 13);
  });

  it('Transfer VLX and wait for confirmed transaction', async function () {
    const initialBalane = (await velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq')).lamports;
    const transferAmount = 1000000;
    const transactionID = await velasNative.transfer({
      payerSeed: 'delay swift sick mixture vibrant element review arm snap true broccoli industry expect thought panel curve inhale rally dish close trade damp skin below',
      toAddress: 'Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq',
      lamports: transferAmount,
    });
    await velasNative.waitForConfirmedTransaction(transactionID);
    // console.log(await velasNative.waitForConfirmedTransaction(transactionID));
    const finalBalance = (await velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq')).lamports;
    assert.equal(finalBalance, initialBalane + transferAmount);
  });
});
