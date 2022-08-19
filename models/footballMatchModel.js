const mongoose = require("mongoose");

const FootballMatchSchema = new mongoose.Schema({
    id: {
        type: Number,
        required: true
    },
    tournament: {
        type: String,
        required: true
    },
    stage: {
        type: String,
        required: true
    },
    homeTeam: {
        type: String,
        required: true
    },
    awayTeam: {
        type: String,
        required: true
    },
    matchDay: {
        type: Number,
        required: false
    },
    dateTime: {
        type: Number,
        required: true
    },
    homeTeamCrest: {
        type: String,
        required: false
    },
    awayTeamCrest: {
        type: String,
        required: false
    },
    isMatchOver: {
        type: Boolean,
        required: true
    },
    finalOutcome: {
        home: {
            type: Boolean,
            required: false
        },
        away: {
            type: Boolean,
            required: false
        },
        draw: {
            type: Boolean,
            required: false
        }
    }

});

const FootballMatch = mongoose.model("FootballMatch", FootballMatchSchema);

module.exports = FootballMatch;