const mongoose = require("mongoose");

const FootballMatchBetsSchema = new mongoose.Schema({
    matchId: {
        type: Number,
        required: true
    },
    poolWalletKey: {
        type: String,
        requried: true
    },
    alias: {
        type: String,
        requried: true
    },
    userWalletKey: {
        type: String,
        required: true
    },
    distribution: {
        home: {
            type: Number,
            required: true
        },
        away: {
            type: Number,
            required: true
        },
        draw: {
            type: Number,
            required: true
        }
    }

});

const FootballMatchBets = mongoose.model("FootballMatchBets", FootballMatchBetsSchema);

module.exports = FootballMatchBets;