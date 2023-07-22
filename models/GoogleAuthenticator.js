const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const GoogleAuthenticator = Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    otp_verified : {
        type: Boolean,
        default: false
    },
    otp_ascii : {
        type: String
    },
    otp_hex : {
        type: String
    },
    otp_auth_url: {
        type: String
    }

}, {
    collection: "google_auth"
})

module.exports = mongoose.model("google_auth", GoogleAuthenticator)