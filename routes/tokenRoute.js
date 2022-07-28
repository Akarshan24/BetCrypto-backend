const express = require('express');
const { FORBIDDEN } = require('../constants');
const { createAndSaveWallets, getWalletBalances } = require('../service/tokenService');
const { verifyToken } = require('../service/authService')
const router = express.Router()
router.post('/create-wallets', async (req, res) => {
    console.log("Create wallet request:", req.body);
    const response = await createAndSaveWallets(req.body.alias);
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
module.exports = router