const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const UserPasswordVerification = Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        require: true 
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
    collection: "userpasswordverification"
})

module.exports = mongoose.model('userpasswordverification', UserPasswordVerification)