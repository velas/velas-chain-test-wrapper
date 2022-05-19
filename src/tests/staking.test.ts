import { log } from '../logger';
import { testData } from '../test-data';
import { assert } from '../assert';
import { velasNative } from '../velas-native';

describe('Staking', function () {
  it('Get inactive stake account', async function () {
    const stakeAccount = await velasNative.getStakeAccount('DJCtfnET5RZZ3mGZycEiYwmd38hhXNNRjBTAzHY6gHJs');
    assert.equal(stakeAccount.state, 'inactive');
    assert.equal(stakeAccount.active, 0);
  });

  it('Get active stake account', async function () {
    const stakeAccount = await velasNative.getStakeAccount('3MNjciHYGtBAYmqFtzFrYFGfktHbRDyCaky4cpie26Hb');
    assert.equal(stakeAccount.state, 'active');
    assert.equal(stakeAccount.active, 14000000000);
  });
});

// TODO:
// create account
