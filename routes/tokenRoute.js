const express = require('express');
const { FORBIDDEN } = require('../constants');
const { createAndSaveUserWallets, getWalletBalances } = require('../service/tokenService');
const { verifyToken } = require('../service/authService');
const { newBTCWallet, getBTCBalance, transferBTC } = require('../modules/bitcoin');
const router = express.Router()
router.post('/create-wallets', async (req, res) => {
    console.log("Create wallet request:", req.body);
    const response = await createAndSaveUserWallets(req.body.alias);
    res.send(response);
})
router.post('/get-wallet-balance', async (req, res) => {
    console.log("Wallet balance request:", req.body);
    const isLoggedIn = verifyToken(req.headers['x-access-token']);
    if (isLoggedIn) {
        const response = await getWalletBalances(req.body.alias);
        return res.json(response);
    }
    else
        res.send({ status: FORBIDDEN });
})
router.post('/admin-test', async (req, res) => {
    const option = req.body.option;
    if (option == 'CREATE') {
        const response = newBTCWallet();
        res.send(response);
    }
    else if (option == 'BALANCE') {
        const response = await getBTCBalance(req.body.publicKey);
        res.send(response);
    }
    else {
        const response = await transferBTC(req.body.privateKey, req.body.sourceAddress, req.body.destinationAddress, req.body.amount, 10);
        res.send(response);
    }
})
module.exports = router