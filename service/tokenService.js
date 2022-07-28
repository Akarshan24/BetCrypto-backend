const { newBTCWallet, transferBTC, getBTCBalance } = require("../modules/bitcoin");
const { saveWallets, getPublicKeys } = require('../dao/walletDao');
const { OK, INTERNAL_ERROR } = require("../constants");
const createAndSaveWallets = async (alias) => {
    const BTCkeys = newBTCWallet(alias);
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
module.exports.createAndSaveWallets = createAndSaveWallets;
module.exports.getWalletBalances = getWalletBalances;