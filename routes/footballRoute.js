const express = require('express');
const { OK } = require('../constants');
const { updateMatchListService, getTournamentIdService, getMatchListForTournamentService } = require('../service/footballService');
const router = express.Router();
// Only to be used by admin to refresh match list
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
module.exports = router;