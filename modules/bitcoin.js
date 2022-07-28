var coinKey = require('coinkey');
var balance = require('crypto-balances');
const { INTERNAL_ERROR, OK } = require('../constants');
const newBTCWallet = (alias) => {
    var wallet = new coinKey.createRandom();
    const privateKey = wallet.privateKey.toString('hex');
    const publicKey = wallet.publicAddress;
    return ({ publicKey, privateKey });
}
const getBTCBalance = async (publicKey) => {
    const response = await balance(publicKey);
    //console.log(response);
    if (response[0].status === 'success')
        return ({ status: OK, balance: response[0].quantity });
    else
        return ({ status: INTERNAL_ERROR });
}
const transferBTC = async (sourceAlias, destinationAddresss, amount) => {
    // fetch pvt. key from alias.
    // send amount to destinationAddresss
}
module.exports.newBTCWallet = newBTCWallet;
module.exports.getBTCBalance = getBTCBalance;
module.exports.transferBTC = transferBTC;
