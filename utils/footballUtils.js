const { INTERNAL_ERROR, OK, ADMIN_WALLET_PUBLIC_KEY } = require("../constants");
const { addTransactionToLogs } = require("../dao/betLogsDao");
const { getBetsByPool } = require("../dao/footballMatchBetsDao");
const { getPoolsFromMatchId } = require("../dao/footballMatchPoolsDao");
const { addToPendingList } = require("../dao/pendingTransactionsDao");
const { getBTCExchangeRate, getBTCBalance } = require("../modules/bitcoin");
const { transferTokens, getBalance, getExchangeRate, getAdminWalletAddress } = require("../service/tokenService");

module.exports.determineSlot = (matchDateTime) => {
    const present = new Date();
    const matchDate = new Date(matchDateTime);
    if ((matchDate - present) > 7200000)//2 hrs
        return 1;
    else if ((matchDate - present) > 0)
        return 2;
    else if (present - matchDate > 2700000)
        return 3;
    return -1;
}
module.exports.settleBets = async (matchId, winner) => {
    // get pools by matchId
    var response = await getPoolsFromMatchId(matchId);
    if (response.status === INTERNAL_ERROR) {
        return response;
    }
    // loop through them
    const poolsList = response.response;
    for (let index in poolsList) {
        const pool = poolsList[index];
        const slot = pool.slot;
        // get bets by pool
        response = await getBetsByPool(pool.poolWallet.publicKey);
        if (response.status === INTERNAL_ERROR) {
            continue;
        }
        // loop through them
        const bets = response.response;
        var wrongOutcomeSum = 0, correctOutcomeSum = 0;
        for (let i in bets) { // Sum of wrong outcomes
            if (winner === "AWAY_TEAM") {
                wrongOutcomeSum = wrongOutcomeSum + bets[i].distribution.home + bets[i].distribution.draw;
                correctOutcomeSum = correctOutcomeSum + bets[i].distribution.away;
            }
            else if (winner === "HOME_TEAM") {
                wrongOutcomeSum = wrongOutcomeSum + bets[i].distribution.away + bets[i].distribution.draw;
                correctOutcomeSum = correctOutcomeSum + bets[i].distribution.home;
            }
            else {
                wrongOutcomeSum = wrongOutcomeSum + bets[i].distribution.home + bets[i].distribution.away;
                correctOutcomeSum = correctOutcomeSum + bets[i].distribution.draw;
            }
        }
        var pendingAmount;
        for (let i in bets) {
            var winnings;
            if (winner === "AWAY_TEAM") {
                winnings = bets[i].distribution.away + (bets[i].distribution.away / correctOutcomeSum) * wrongOutcomeSum;
            }
            else if (winner === "HOME_TEAM") {
                winnings = bets[i].distribution.home + (bets[i].distribution.home / correctOutcomeSum) * wrongOutcomeSum;
            }
            else {
                winnings = bets[i].distribution.draw + (bets[i].distribution.draw / correctOutcomeSum) * wrongOutcomeSum;
            }
            var serviceCharge;
            if (slot === 1) {
                serviceCharge = 0.05 * winnings;
            }
            else if (slot === 2) {
                serviceCharge = 0.08 * winnings;
            }
            else {
                serviceCharge = 0.05 * (bets[i].distribution.away + bets[i].distribution.home + bets[i].distribution.draw);
                serviceCharge = serviceCharge + 0.1 * winnings;
            }
            const amount = winnings - serviceCharge;
            const exchangeRate = await getExchangeRate(pool.poolWallet.currency, 'USD');
            if (amount * exchangeRate.min < 1) { // No payouts if winnings < $1
                response = await addTransactionToLogs({ matchId, alias: bets[i].alias, poolWalletKey: pool.poolWallet.publicKey, userWalletKey: bets[i].userWalletKey, transactionType: 'NO_PAYOUT', transactionId: "N/A", amount });
                continue;
            }
            response = await transferTokens(pool.poolWallet.privateKey, pool.poolWallet.publicKey, bets[i].userWalletKey, amount, pool.poolWallet.currency);

            if (response.status === OK) {
                const txid = response.data.txid;
                response = await addTransactionToLogs({ matchId, alias: bets[i].alias, poolWalletKey: pool.poolWallet.publicKey, userWalletKey: bets[i].userWalletKey, transactionType: 'CREDIT', transactionId: txid, amount });
            }
            else {
                pendingAmount += amount;
                response = await addToPendingList({ matchId, alias: bets[i].alias, source: { publicKey: pool.poolWallet.publicKey, privateKey: pool.poolWallet.privateKey }, destination: bets[i].userWalletKey, transactionType: 'CREDIT', amount, currency: pool.poolWallet.currency });
            }

        }
        // transfer remaining money to admin wallet
        response = await getBalance(pool.poolWallet.publicKey, pool.poolWallet.currency);
        if (response.status === INTERNAL_ERROR) {
            response = await addToPendingList({ matchId, alias: 'ADMIN', source: { publicKey: pool.poolWallet.publicKey, privateKey: pool.poolWallet.privateKey }, destination: getAdminWalletAddress(pool.poolWallet.currency), transactionType: 'CREDIT', amount, currency: pool.poolWallet.currency });

        }
        const balance = response.balance;
        response = await transferTokens(pool.poolWallet.privateKey, pool.poolWallet.publicKey, getAdminWalletAddress(pool.poolWallet.currency), (balance - pendingAmount), pool.poolWallet.currency);
        if (response.status === INTERNAL_ERROR) {
            response = await addToPendingList({ matchId, alias: 'ADMIN', source: { publicKey: pool.poolWallet.publicKey, privateKey: pool.poolWallet.privateKey }, destination: getAdminWalletAddress(pool.poolWallet.currency), transactionType: 'CREDIT', amount, currency: pool.poolWallet.currency });
        }
        else {
            response = await addTransactionToLogs({ matchId, alias: 'ADMIN', poolWalletKey: pool.poolWallet.publicKey, userWalletKey: bets[i].userWalletKey, transactionType: 'CREDIT', transactionId: response.data.txid, amount })
        }
    }
    return ({ status: OK });
}