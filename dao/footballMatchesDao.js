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
const getMatch = async (id) => {
    const response = await FootballMatch.findOne({ id }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}
module.exports.getFinishedMatches = async (present) => {
    const threshold = present - 10800000; // any match that started 3 hrs before present time
    const response = await FootballMatch.find({ dateTime: { $lte: threshold } }, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, data: response });
}
module.exports.updateMatchDetails = async (id, object) => {
    try {
        const response = await FootballMatch.updateOne({ id }, object);
        return ({ status: OK });
    }
    catch (err) {
        console.log("Error updating match details:%s", err);
        return ({ status: INTERNAL_ERROR });
    }

}
module.exports.getMatch = getMatch
module.exports.saveMatchDetails = saveMatchDetails
module.exports.getMatchesForTournament = getMatchesForTournament;