"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.helpers = void 0;
exports.helpers = {
    async sleep(seconds) {
        return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
    },
    stringify(json) {
        return JSON.stringify(json, null, 2);
    },
};
//# sourceMappingURL=helpers.js.map