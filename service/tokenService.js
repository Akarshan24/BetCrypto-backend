const { newBTCWallet, transferBTC, getBTCBalance, getBTCExchangeRate } = require("../modules/bitcoin");
const { saveWallets, getPublicKeys } = require('../dao/walletDao');
const { OK, INTERNAL_ERROR, SUPPORTED_TOKENS, SATOSHI_PER_BYTE_FOR_BTC_TRANSFER, ADMIN_WALLET_PUBLIC_KEY } = require("../constants");
const createAndSaveUserWallets = async (alias) => {
    const BTCkeys = newBTCWallet();
    //const { ETHpublicKey, ETHprivateKey } = newETHWallet(alias);
    const response = await saveWallets({ alias, bitcoin: { publicKey: BTCkeys.publicKey, privateKey: BTCkeys.privateKey } });
    return response;
}
const getWalletBalances = async (alias) => {
    var response = await getPublicKeys(alias);
    if (response.status === OK) {
        const keys = response.data;
        const BTCpublicKey = keys.bitcoin.publicKey;
        //const ETHpublicKey = keys.ether.publicKey;
        const btcBalance = await getBTCBalance(BTCpublicKey);
        //console.log(btcBalance);
        //const ethBalance = getEthBalance(ETHpublicKey);
        return ({ status: OK, balances: { BTC: btcBalance.balance } });
    }
    return ({ status: INTERNAL_ERROR });
}
const createBettingPoolWallet = (currency) => {
    if (currency === SUPPORTED_TOKENS[0]) {
        const BTCkeys = newBTCWallet();
        return BTCkeys;
    }
    return null;
}
module.exports.transferTokens = async (privateKey, sourceAddress, destinationAddresss, amount, currency) => {
    if (currency === SUPPORTED_TOKENS[0]) { // BTC
        const response = await transferBTC(privateKey, sourceAddress, destinationAddresss, amount, SATOSHI_PER_BYTE_FOR_BTC_TRANSFER);
        return response;
    }
    // write code for other currencies
}
module.exports.getBalance = async (address, currency) => {
    if (currency === SUPPORTED_TOKENS[0]) {
        const response = await getBTCBalance(address);
        return response;
    }
    return ({ status: INTERNAL_ERROR });
}
module.exports.getExchangeRate = async (crypto, currency) => {
    if (crypto === SUPPORTED_TOKENS[0]) {
        const response = await getBTCExchangeRate(currency);
        return response;
    }
    return ({ status: INTERNAL_ERROR });
}
module.exports.getAdminWalletAddress = async (currency) => {
    if (currency === SUPPORTED_TOKENS[0])
        return ADMIN_WALLET_PUBLIC_KEY.BTC;
    console.log("%s not a supported token", currency);
    return ({ status: INTERNAL_ERROR });
}
module.exports.createAndSaveUserWallets = createAndSaveUserWallets;
module.exports.getWalletBalances = getWalletBalances;
module.exports.createBettingPoolWallet = createBettingPoolWallet