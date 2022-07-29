const { INTERNAL_ERROR, OK } = require("../constants");
const FootballTournament = require("../models/footballTournamentModel")

const saveTournamentDetails = async (league) => {
    const res = await FootballTournament.findOne(league, (err, result) => { }).clone().catch(function (err) { console.log(err) });
    //console.log(res);
    if (!res) {
        const response = await FootballTournament.create(league);
        return response;
    }
}
const getTournaments = async () => {
    const response = await FootballTournament.find({}, (err, res) => {
        if (err) {
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    return ({ status: OK, response });
}
const getTournamentFromID = async (id) => {
    //console.log(id);
    const response = await FootballTournament.findOne({ tournamentId: id }, (err, res) => {
        if (err) {
            console.log("Error:", err);
            return ({ status: INTERNAL_ERROR });
        }
    }).clone().catch(function (err) { console.log(err) });
    //console.log(response);
    return ({ status: OK, response });
}
module.exports.saveTournamentDetails = saveTournamentDetails;
module.exports.getTournaments = getTournaments;
module.exports.getTournamentFromID = getTournamentFromID