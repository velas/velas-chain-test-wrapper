"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpers = void 0;
const bs58_1 = __importDefault(require("bs58"));
exports.helpers = {
    async sleep(miliSeconds) {
        return new Promise((resolve) => setTimeout(resolve, miliSeconds));
    },
    stringify(json) {
        return JSON.stringify(json, null, 2);
    },
    bs58EncodedPrivateKeyToBytesArray(privateKey) {
        const privateKeyAsHexString = bs58_1.default.decode(privateKey).toString('hex');
        const privateKeyAsBytesArray = Buffer.from(privateKeyAsHexString, 'hex').toJSON().data.toString();
        return privateKeyAsBytesArray;
    },
    bytesArrayToHexString(bytesArray) {
        return Buffer.from(bytesArray).toString('hex');
    },
};
//# sourceMappingURL=helpers.js.map