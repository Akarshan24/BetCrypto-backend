const mongoose = require("mongoose");

const FootballTournamentSchema = new mongoose.Schema({
    tournamentId: {
        type: Number,
        required: true
    },
    tournament: {
        type: String,
        required: true
    }

});

const FootballTournament = mongoose.model("FootballTournament", FootballTournamentSchema);

module.exports = FootballTournament;