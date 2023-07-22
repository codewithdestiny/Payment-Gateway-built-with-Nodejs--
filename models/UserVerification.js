const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserVerificationModel = Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        require: true 
    },
    code : {
        type: String, 
        required: true
    },
    token: {
        type: String,
        required: true
    },
    create_at : {
        type: Date,
        default: Date.now()
    },
    expire_at: {
        type: Date,
        require: true
    }
}, {
    collection: "userverifyaccount"
})

module.exports = mongoose.model('userverifyaccount', UserVerificationModel)