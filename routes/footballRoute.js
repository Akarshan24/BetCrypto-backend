const express = require('express');
const { OK } = require('../constants');
const { settleMatchService, getMatchFromId, updateMatchListService, getTournamentIdService, getMatchListForTournamentService, placeBetService, getPoolsForMatch } = require('../service/footballService');
const router = express.Router();
// Only to be used by admin to refresh match list
//ToDo : Add admin token verification
router.get('/update-match-list', async (req, res) => {
    await updateMatchListService();
    res.send({ status: OK })
});
// get list of matches based on tournamentId 
// response.response for the response
router.get('/get-match-list', async (req, res) => {
    const tournamentId = req.query.tournamentId;
    const response = await getMatchListForTournamentService(tournamentId);
    res.send(response);
})
// return the name and ids of all tournaments
// response.response for the response
router.get('/get-tournaments', async (req, res) => {
    const response = await getTournamentIdService();
    res.send(response);
})
router.get('/get-match-details', async (req, res) => {
    const id = req.query.id;
    const response = await getMatchFromId(id);
    res.send(response);
})
router.post('/place-bet', async (req, res) => {
    const { alias, matchId, entryFee, slot, poolWalletKey, distribution, currency } = req.body;
    const response = await placeBetService(alias, matchId, entryFee, slot, poolWalletKey, distribution, currency);
    return response;
})
//ToDo : Add admin token verification
router.post('/settle-match', async (req, res) => {
    const response = await settleMatchService();
    res.send(response);
})
router.get('/get-pools-for-match', async (req, res) => {
    //console.log(req);
    const { id } = req.query;
    //console.log(id, slot);
    const response = await getMatchFromId(id);
    console.log(response);
    //res.set({ 'Access-Control-Allow-Origin': 'http://localhost:3000' })
    res.send(response);
})
module.exports = router;