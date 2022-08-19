const { OK, INTERNAL_ERROR } = require('../constants');
const FootballMatchPools = require('../models/footballMatchPoolsModel')
module.exports.saveBettingPoolWallet = async (currency, matchId, tournamentId, slot, poolCapacity, entryFee, keys) => {
    try {
        const response = await FootballMatchPools.create({ matchId, tournamentId, poolCapacity, slot, entryFee, isOpen: true, poolWallet: { currency, privateKey: keys.privateKey, publicKey: keys.publicKey }, betsPlaced: 0 });
        if (response)
            return ({ status: OK })
    }
    catch (error) {
        console.log("Error while saving pool details:", error);
        return ({ status: INTERNAL_ERROR });
    }
}
module.exports.getPoolDetailsFromPoolWallet = async (poolWalletKey) => {
    const response = await FootballMatchPools.findOne({ poolWalletKey }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}
module.exports.getPoolsFromMatchIdAndSlot = async (matchId, slot) => {
    const response = await FootballMatchPools.find({ matchId, slot }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).select('poolCategory poolCapacity poolWallet.currency poolWallet.publicKey entryFee betsPlaced').clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}
module.exports.updatePoolDetails = async (query, object) => {
    try {
        const response = await FootballMatchPools.updateOne(query, object);
        return ({ status: OK });
    }
    catch (err) {
        console.log("Error updating pool details:%s", err);
        return ({ status: INTERNAL_ERROR });
    }

}
module.exports.getPoolsFromMatchId = async (matchId) => {
    const response = await FootballMatchPools.find({ matchId }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}