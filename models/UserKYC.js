const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const UserKYC = Schema({

    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    modified_at : {
        type: Date
    }

}, {
    collection: "user_kyc"
})

module.exports = mongoose.model("user_kyc", UserKYC);