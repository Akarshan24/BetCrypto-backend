const { INTERNAL_ERROR, OK } = require('../constants');
const walletModel = require('../models/walletModel');
const getWallets = async (alias) => {
    const response = await walletModel.findOne({ alias });
    return response;
}
const saveWallets = async (object) => {
    try {
        console.log("Walletdao-->", object);
        const response = await walletModel.create(object);
    }
    catch (err) {
        console.log("Error while saving wallets: ", err);
        return ({ status: INTERNAL_ERROR, message: err });
    }
    return ({ status: OK });
}
const getPublicKeys = async (alias) => {
    var response;
    try {
        response = await walletModel.findOne({ alias }).select('bitcoin.publicKey');
    }
    catch (err) {
        console.log("Error while fetching wallets: ", err);
        return ({ status: INTERNAL_ERROR, message: err });
    }
    return ({ status: OK, data: response });
}
const getWalletInfo = async (alias, currency) => {
    var token;
    if (currency == 'BTC')
        token = 'bitcoin';
    var response;
    try {
        response = await walletModel.findOne({ alias }).select(`${token}`);
    }
    catch (err) {
        console.log("Error while fetching wallets: ", err);
        return ({ status: INTERNAL_ERROR, message: err });
    }
    return ({ status: OK, data: response });
}
module.exports.saveWallets = saveWallets;
module.exports.getPublicKeys = getPublicKeys;
module.exports.getWalletInfo = getWalletInfo;