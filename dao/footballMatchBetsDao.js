const { OK, INTERNAL_ERROR } = require('../constants');
const FootballMatchBets = require('../models/footballMatchBetsModel')
module.exports.saveBetDetails = async (alias, matchId, userWalletKey, poolWalletKey, distribution) => {
    try {
        const response = FootballMatchBets.create({ alias, matchId, userWalletKey, poolWalletKey, distribution })
        return ({ status: OK, data: response });
    }
    catch (error) {
        console.log("Error while saving bet details:%s", error);
        return ({ status: INTERNAL_ERROR });
    }
}
module.exports.removeBet = async (alias, poolWalletKey) => {
    try {
        const response = FootballMatchBets.deleteOne({ alias, poolWalletKey });
        return ({ status: OK });
    }
    catch (error) {
        console.log("Error while removing bet details:%s", error);
        return ({ status: INTERNAL_ERROR });
    }
}
module.exports.getBetsByPool = async (poolWalletKey) => {
    const response = await FootballMatchBets.find({ poolWalletKey }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}