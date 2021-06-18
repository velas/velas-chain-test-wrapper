import { log } from '../../logger';
import { VelasNative } from '../velas-native';

const velasNative = new VelasNative();

describe('Health check', function () {
  this.timeout(300000);

  it('Get epoch info', async function () {
    const epochInfo = await velasNative.getEpochInfo();
    log.warn(epochInfo);
  });

  it.only('No skipped blocks', async function () {
    const slot = await velasNative.getSlot();
    const lastConfirmedBlock = slot - 100;
    // blocks in epoch – 432000
    for (let block = lastConfirmedBlock; block >= lastConfirmedBlock - 43; block--) {
      log.warn('block', block);
      await velasNative.getConfirmedBlock(block);
    }
  });
});
