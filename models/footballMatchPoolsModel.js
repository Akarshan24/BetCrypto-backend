const mongoose = require("mongoose");

const FootballMatchPoolsSchema = new mongoose.Schema({
    matchId: {
        type: Number,
        required: true
    },
    tournamentId: {
        type: Number,
        required: true
    },
    poolCategory: {
        type: String,
        required: true
    },
    poolCapacity: {
        type: Number,
        required: true
    },
    slot: {
        type: Number,
        required: true
    },
    poolWallet: {
        currency: {
            type: String,
            required: true
        },
        publicKey: {
            type: String,
            required: true
        },
        privateKey: {
            type: String,
            required: true
        }
    },
    entryFee: {
        type: Number,
        required: true
    },
    isOpen: {
        type: Boolean,
        required: true
    },
    betsPlaced: {
        type: Number,
        required: true
    }
});

const FootballMatchPools = mongoose.model("FootballMatchPools", FootballMatchPoolsSchema);

module.exports = FootballMatchPools;