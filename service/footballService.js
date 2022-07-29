const cron = require('node-cron');
const { getCompetitionIDs, updateMatchListHandler } = require('../handler/footballHandler');
const { saveMatchDetails, getMatchesForTournament } = require('../dao/footballMatchesDao');
const { getTournaments, saveTournamentDetails, getTournamentFromID } = require('../dao/footballTournamentDao');
const { INTERNAL_ERROR } = require('../constants');
// this will run everyday at 00:00 UTC
const updateMatchListService = async () => {
    const date = new Date();
    const dateFrom = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    date.setDate(date.getDate() + 30);
    const dateTo = date.getFullYear() + "-" + (date.getMonth() < 10 ? '0' + date.getMonth() : date.getMonth()) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    const res = await getCompetitionIDs();
    if (res) {
        Object.entries(res).forEach(async x => {
            const tournamentId = x[1].id;
            const response = await updateMatchListHandler(tournamentId, dateFrom, dateTo);
            const tournament = x[1].name;
            Object.entries(response.matches).forEach(async match => {
                //console.log(match);
                const id = match[1].id;
                const dateTime = new Date(match[1].utcDate).getTime();
                const matchDay = match[1].matchday;
                const homeTeam = match[1].homeTeam.name;
                const awayTeam = match[1].awayTeam.name;
                const stage = match[1].stage;
                const homeTeamCrest = match[1].homeTeam.crest;
                const awayTeamCrest = match[1].awayTeam.crest;
                await saveMatchDetails({ tournament, dateTime, matchDay, homeTeam, awayTeam, homeTeamCrest, awayTeamCrest, stage, id });

            });
            await saveTournamentDetails({ tournament, tournamentId });
        })
    }
}
const getTournamentIdService = async () => {
    const response = await getTournaments();
    return response;
}
const getMatchListForTournamentService = async (id) => {
    var response = await getTournamentFromID(id);
    if (response.status === INTERNAL_ERROR)
        return response;
    const name = response.response.tournament;
    response = await getMatchesForTournament(name);
    return response;
}
module.exports.updateMatchListService = updateMatchListService;
module.exports.getTournamentIdService = getTournamentIdService;
module.exports.getMatchListForTournamentService = getMatchListForTournamentService;