## This repo is a wrapper for velas chain testing

### Currenyly exported modules:
- velasNative

### Modules in progress:
- velasEVM

### Usage example

```
npm i
import {velasNative} from './src'
await velasNative.getBalance('DVSjUmoQistXei6HTw7mtv1ufnm7RVCn1JVZ3EGGAL1z');
```

### Run test
`npm test`
or
`npx ts-mocha ./src/tests/**`

### Build
`tsc`

### Publish package
npm init --scope=@velas
npm publish --access public


#### How to test private key validity
1. Export private key from wallet.
2. Call `bs58EncodedPrivateKeyToBytesArray` method from `helpers` (which is part of this lib) and pass exported key as parameter.

    Example
    ```
    import {helpers} from '../helpers';
    helpers.bs58EncodedPrivateKeyToBytesArray('q1RcoioAQYytEHDKpJFnau8qx5yfeKMskKyq3J5Xx9mku2eBDKLYCF');
    ```
    You will receive the array of bytes, e.g. `[11,17,54,46,175,65,179,60,57,230,205,146,45,130,56,142,207,246]`.

3. Create .json file with this array.
4. Run next command
`velas-keygen pubkey <path_to_file>`

If you get the wallet address without any errors and this address corresponds to the address from wallet app – all is fine.
