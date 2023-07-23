const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const UserWallet = Schema({
    userId : {
        type: mongoose.Types.ObjectId,
        ref: 'user'
    },
    flw_ref: {
        type: String,
        default: ''
    },
    account_id: {
        type: String,
        default: ''
    },
    order_ref: {
        type: String,
        default: ''
    },
    account_number: {
        type: String,
        default: ''
    },
    account_name: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    bank_name: {
        type: String,
        default: ''
    },
    currency: {
        type: String,
        default: ''
    },
    expire_date: {
        type: Date,
        default: ''
    },
    created_at : {
        type: Date,
        default: ''
    },
    account_status: {
        type: String,
        default: ''
    },
    frequency: {
        type: Number,
        default: ''
    },
    avail_bal: {
        type: Number,
    },
    bvn: {
        type: String,
        default: ''
    }
}, {
    collection: "userwallet"
})


module.exports = mongoose.model('userwallet', UserWallet);