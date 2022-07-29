const { INTERNAL_ERROR, OK } = require("../constants");
const FootballMatch = require("../models/footballMatchModel")

const saveMatchDetails = async (match) => {
    const res = await FootballMatch.findOne({ id: match.id }, (err, docs) => { }).clone().catch(function (err) { console.log(err) });
    if (!res) {
        try {
            const response = await FootballMatch.create(match);
        }
        catch (err) {
            console.log("Error while updating match list:", err, match);
        }
    }
}
const getMatchesForTournament = async (tournament) => {
    const response = await FootballMatch.find({ tournament }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}
module.exports.saveMatchDetails = saveMatchDetails
module.exports.getMatchesForTournament = getMatchesForTournament;