const fetch = require('node-fetch');
const getCompetitionIDs = async () => {
    const response = await fetch('http://api.football-data.org/v4/competitions/', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': 'c2c8f8a520654919939355bdbbc561ea'
        }
    });
    var data = await response.json();
    data = data.competitions;
    return data;
}
const updateMatchListHandler = async (tournamentId, dateFrom, dateTo) => {
    //console.log(`http://api.football-data.org/v4/competitions/${tournamentId}/matches?dateFrom=${dateFrom}&&dateTo=${dateTo}`)
    const response = await fetch(`http://api.football-data.org/v4/competitions/${tournamentId}/matches?dateFrom=${dateFrom}&&dateTo=${dateTo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': 'c2c8f8a520654919939355bdbbc561ea'
        }
    });
    var data = await response.json();
    return data;
}
module.exports.getMatchDetails = async (matchId) => {
    const response = await fetch(`http://api.football-data.org/v4/matches/${matchId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'X-Auth-Token': 'c2c8f8a520654919939355bdbbc561ea'
        }
    });
    var data = await response.json();
    return data;
}
module.exports.getCompetitionIDs = getCompetitionIDs;
module.exports.updateMatchListHandler = updateMatchListHandler;