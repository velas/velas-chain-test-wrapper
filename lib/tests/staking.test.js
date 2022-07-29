"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = require("../assert");
const velas_native_1 = require("../velas-native");
describe('Staking', function () {
    it('Get inactive stake account', async function () {
        const stakeAccount = await velas_native_1.velasNative.getStakeAccount('DJCtfnET5RZZ3mGZycEiYwmd38hhXNNRjBTAzHY6gHJs');
        assert_1.assert.equal(stakeAccount.state, 'inactive');
        assert_1.assert.equal(stakeAccount.active, 0);
    });
    it('Get active stake account', async function () {
        const stakeAccount = await velas_native_1.velasNative.getStakeAccount('3MNjciHYGtBAYmqFtzFrYFGfktHbRDyCaky4cpie26Hb');
        assert_1.assert.equal(stakeAccount.state, 'active');
        assert_1.assert.equal(stakeAccount.active, 14000000000);
    });
});
// TODO:
// create account
//# sourceMappingURL=staking.test.js.map