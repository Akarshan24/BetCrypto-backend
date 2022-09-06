module.exports = Object.freeze({
    PORT: 3001,
    DEV_DB: 'betcrypto_dev',
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    INTERNAL_ERROR: 500,
    SUPPORTED_TOKENS: ['BTC'],
    POOL_CAPACITY: [2, 5, Infinity],
    POOL_SLOTS: [1, 2, 3],
    ENTRY_FEE_LIST: [5, 10, 20, 50],
    TESTNET_BTC: "BTCTEST",
    MAINNET_BTC: "BTC",
    IS_PROD: false,
    BTC_DOMAIN: 'https://chain.so/api/v2',
    SATOSHI_PER_BYTE_FOR_BTC_TRANSFER: 5,
    ADMIN_WALLET_PUBLIC_KEY: {
        BTC: "XYZ"
    }
})