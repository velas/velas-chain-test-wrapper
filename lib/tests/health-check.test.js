"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("../logger");
const test_data_1 = require("../test-data");
const assert_1 = require("../assert");
const velas_native_1 = require("../velas-native");
describe('Health check', function () {
    // this.timeout(300000);
    it('Get epoch info', async function () {
        const epochInfo = await velas_native_1.velasNative.getEpochInfo();
        assert_1.assert.isAbove(epochInfo.epoch, 48);
    });
    xit('No skipped blocks', async function () {
        const slot = await velas_native_1.velasNative.getSlot();
        const lastConfirmedSlotNumber = slot - 100;
        // blocks in epoch – 432000
        for (let blockIndex = lastConfirmedSlotNumber; blockIndex >= lastConfirmedSlotNumber - 43; blockIndex--) {
            logger_1.log.warn('block', blockIndex);
            const blockInfo = await velas_native_1.velasNative.getConfirmedBlock(blockIndex);
            if (!blockInfo) {
                throw new Error(`No confirmed block found with slot number ${blockIndex}`);
            }
        }
    });
    it('Get account balance', async function () {
        assert_1.assert.equal((await velas_native_1.velasNative.getBalance('6hUNaeEwbpwEyQVgfTmZvMK1khqs18kq6sywDmRQgGyb')).VLX, 13);
    });
    it('Transfer VLX and wait for confirmed transaction', async function () {
        const initialBalane = (await velas_native_1.velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq')).lamports;
        const transferAmount = 1000000;
        const transactionID = await velas_native_1.velasNative.transfer({
            payerSeed: test_data_1.testData.payer.seed,
            toAddress: 'Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq',
            lamports: transferAmount,
        });
        await velas_native_1.velasNative.waitForConfirmedTransaction(transactionID);
        const finalBalance = (await velas_native_1.velasNative.getBalance('Hj6ibSJDYE5nyNynGQiktsL8fuGqZrpeXatLG61hh4Sq')).lamports;
        assert_1.assert.equal(finalBalance, initialBalane + transferAmount);
    });
});
// TODO:
// create account
//# sourceMappingURL=health-check.test.js.map