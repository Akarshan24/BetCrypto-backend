const { getCompetitionIDs, updateMatchListHandler, getMatchDetails } = require('../handler/footballHandler');
const { getMatch, saveMatchDetails, getMatchesForTournament, getFinishedMatches, updateMatchDetails } = require('../dao/footballMatchesDao');
const { getTournaments, saveTournamentDetails, getTournamentFromID } = require('../dao/footballTournamentDao');
const { INTERNAL_ERROR, OK, SUPPORTED_TOKENS, POOL_CAPACITY, POOL_SLOTS, ENTRY_FEE_LIST, FORBIDDEN } = require('../constants');
const { createBettingPoolWallet, transferTokens } = require('./tokenService');
const { saveBetDetails } = require('../dao/footballMatchBetsDao');
const { getWalletInfo } = require('../dao/walletDao');
const { saveBettingPoolWallet, getPoolDetailsFromPoolWallet, getPoolsFromMatchIdAndSlot, getPoolsFromMatchId } = require('../dao/footballMatchPoolsDao.js');
const { determineSlot } = require('../utils/footballUtils');
const { addTransactionToLogs } = require('../dao/betLogsDao');
// TODO: this will run everyday at 00:00 UTC
const updateMatchListService = async () => {
    const date = new Date();
    let month = date.getMonth() + 1;
    const dateFrom = date.getFullYear() + "-" + (month < 10 ? '0' + month : month) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    date.setDate(date.getDate() + 15);
    month = date.getMonth() + 1;
    const dateTo = date.getFullYear() + "-" + (month < 10 ? '0' + month : month) + "-" + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
    console.log("Updating Match Lists for: " + dateFrom + " to " + dateTo);
    const res = await getCompetitionIDs();
    await new Promise(r => setTimeout(r, 6000));
    //6.5s interval between API calls to respect the 10 calls/minute limit
    for (let index in res) {
        const data = res[index];
        const tournamentId = data.id;
        const response = await updateMatchListHandler(tournamentId, dateFrom, dateTo);
        const tournament = data.name;
        console.log("Tournament: %s; Number of Matches: %s", tournament, response.matches.length);
        Object.entries(response.matches).forEach(async match => {
            const id = match[1].id;
            const dateTime = new Date(match[1].utcDate).getTime();
            const matchDay = match[1].matchday;
            const homeTeam = match[1].homeTeam.name;
            const awayTeam = match[1].awayTeam.name;
            const stage = match[1].stage;
            const homeTeamCrest = match[1].homeTeam.crest;
            const awayTeamCrest = match[1].awayTeam.crest;
            //console.log(homeTeamCrest);
            await saveMatchDetails({ tournament, dateTime, matchDay, homeTeam, awayTeam, homeTeamCrest, awayTeamCrest, stage, id, isMatchOver: false });
            await createPoolsForNewMatch(id, tournamentId);
        });
        await saveTournamentDetails({ tournament, tournamentId });
        //console.log("Tournament:", data.name);
        await new Promise(r => setTimeout(r, 6000));
    }
}

const getTournamentIdService = async () => {
    const response = await getTournaments();
    console.log(response);
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
const getMatchFromId = async (id) => {
    var response = await getMatch(id);
    if (response.status === INTERNAL_ERROR) {
        console.log("Error while fetching match:", id);
        return ({ status: INTERNAL_ERROR });
    }
    var data = response.response;
    const slot = determineSlot(data.dateTime);
    if (slot === -1)
        return ({ status: FORBIDDEN });
    response = await getPoolsFromMatchIdAndSlot(id, slot);
    if (response.status === INTERNAL_ERROR)
        return ({ status: INTERNAL_ERROR });
    data.poolsList = response.response; // appending pools list
    return ({ status: OK, response: data });
}
const createPoolsForNewMatch = async (matchId, tournamentId) => {
    for (let currency in SUPPORTED_TOKENS) {
        for (let poolCapacity in POOL_CAPACITY) {
            for (let slot in POOL_SLOTS) {
                for (let entryFee in ENTRY_FEE_LIST) {
                    if (POOL_CAPACITY[poolCapacity] <= 20 && ENTRY_FEE_LIST[entryFee] <= 5)
                        continue;
                    if ((POOL_SLOTS[slot] > 1 && POOL_CAPACITY[poolCapacity] > 50) || (POOL_SLOTS[slot] > 2 && POOL_CAPACITY[poolCapacity] > 20))
                        continue;
                    var poolCategory;
                    if (POOL_CAPACITY[poolCapacity] < 20)
                        poolCategory = 'WINNER_TAKES_ALL';
                    else
                        poolCategory = 'DISTRIBUTED';
                    await createBettingPoolService(SUPPORTED_TOKENS[currency], matchId, tournamentId, poolCategory, POOL_SLOTS[slot], POOL_CAPACITY[poolCapacity], ENTRY_FEE_LIST[entryFee]);
                }
            }
        }
    }
}
const createBettingPoolService = async (currency, matchId, tournamentId, slot, poolCapacity, entryFee) => {
    const keys = createBettingPoolWallet(currency);
    if (keys) {
        const response = await saveBettingPoolWallet(currency, matchId, tournamentId, slot, poolCapacity, entryFee, keys)
        if (response.status === OK)
            return response;
        console.log("Error while saving wallet. Request:%s\nResponse:%s", ({ currency, matchId, tournamentId, slot, poolCapacity, entryFee, keys }), response)
    }
    else {
        console.log("Wrong currency:%s", currency);
    }
}
module.exports.placeBetService = async (alias, matchId, entryFee, slot, poolWalletKey, distribution, currency) => {
    // save bet details
    var response = await saveBetDetails(alias, matchId, sourceAddress, poolWalletKey, distribution);
    if (response.status === OK) {
        // transfer money
        const userKeys = await getWalletInfo(alias, currency);
        const privateKey = userKeys.data.bitcoin.privateKey;
        const sourceAddress = userKeys.data.bitcoin.publicKey;
        response = await transferTokens(privateKey, sourceAddress, poolWalletKey, entryFee, currency);
        if (response.status === OK) {
            // update bet logs
            const txid = response.data.txid;
            response = await addTransactionToLogs({ matchId, alias, poolWalletKey, userWalletKey: sourceAddress, transactionType: 'DEBIT', transactionId: txid, amount: entryFee });
            // update the betting pool
            response = await getPoolDetailsFromPoolWallet(poolWalletKey);
            var data = response.response;
            data.betsPlaced = data.betsPlaced + 1;
            if (data.betsPlaced === data.poolCapacity) {
                // pool closed
                data.isOpen = false;
                //create new pool
                response = await createBettingPoolService(currency, matchId, tournamentId, slot, data.poolCapacity, entryFee);

            }
            // update the current pool
            response = await updatePoolDetails(poolWalletKey, data);


        }
        else { // money transfer not successful
            response = await removeBet({ alias, poolWalletKey });
            return ({ status: INTERNAL_ERROR });
        }

    }
}
// ToDo: Invoke this everyday at 12
module.exports.settleMatchService = async () => {
    const present = new Date();
    //get finished matches
    var response = await getFinishedMatches(present.getTime());
    await new Promise(r => setTimeout(r, 6000));
    const matchList = response.data;
    for (let index in matchList) {
        //update outcome of every match
        var match = matchList[index];
        response = await getMatchDetails(match.id);
        if (response.status === "FINISHED") {
            match.isMatchOver = true;
            const outcome = response.score.winner;
            if (outcome === "AWAY_TEAM") {
                match.finalOutcome = { home: false, away: true, draw: false };
            }
            else if (outcome === "HOME_TEAM") {
                match.finalOutcome = { home: true, away: false, draw: fals };
            }
            else {
                match.finalOutcome = { home: false, away: false, draw: true };
            }
            //update match db
            response = await updateMatchDetails(match.id, match);
            if (response.status === OK) {
                response = await settleBets(match.id, outcome);
            }
        }

        await new Promise(r => setTimeout(r, 6000));

    }
}
module.exports.getPoolsForMatch = async (id, slot) => {
    const response = await getPoolsFromMatchIdAndSlot(id, slot);
    return response;
}
module.exports.getMatchFromId = getMatchFromId;
module.exports.updateMatchListService = updateMatchListService;
module.exports.getTournamentIdService = getTournamentIdService;
module.exports.getMatchListForTournamentService = getMatchListForTournamentService;