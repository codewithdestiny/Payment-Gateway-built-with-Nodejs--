const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userModel = Schema({
    firstname: {
        type: String,
        default: ''
    },
    username: {
        type: String,
        default: ''
    },
    lastname: {
        type: String,
        default: ''
    },
    phone_no: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: '',
        required: true,
        lowercase : true
    },
    is_active : {
        type: Boolean,
        default: true
    },
    is_verified: {
        type: Boolean,
        default: false
    },
    joined_since : {
        type: Date,
        default: Date.now()
    },
    password : {
        type: String,
        required: true
    },
    is_otp_enabled : {
        type: Boolean,
        default: false
    },
    login_attempt: {
        type: Number,
        default: 0
    },
    ipAddress : {
        type: String,
        default: ''
    },
    profile_pic_url : {
        type: String,
        default: ''
    },
    is_kyc_verified: {
        type: Boolean,
        default: false
    },
    device_fingerprint: {
        type: String,
        default: ''
    },
    country: {
        type: String,
        default: ''
    },
    why_disabled: {

        invalid_login : {
            type: Boolean,
            default: false
        },
        others: {
            type: Boolean,
            default: false
        }
        
    },
    roles : {
        name: {
            type: String,
            default: ''
        },
        permissions: {
            can_create: {
                type: Boolean,
                default: true
            },
            can_delete: {
                type: Boolean,
                default: true 
            },
            can_update: {
                type: Boolean,
                default: true
            },
            can_read : {
                type: Boolean,
                default: true
            },
            created_at: {
                type: Date,
                default: Date.now()
            },
            modified_at : {
                type: Date,
                default: Date.now()
            }
        },
    },

}, {
    collection : 'user'
})

module.exports = mongoose.model('user', userModel);