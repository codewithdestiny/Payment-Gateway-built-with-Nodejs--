const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const StaffAdminModel = Schema({
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
    is_logged_in: {
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
    admin_personal_email: {
        type: String,
        default: ''
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
    is_admin: {
        type: Boolean,
        default: false
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
        is_staff: {
            type: Boolean,
            default: true
        },
        permissions: {
            can_create: {
                type: Boolean,
                default: false
            },
            can_delete: {
                type: Boolean,
                default: false 
            },
            can_update: {
                type: Boolean,
                default: false
            },
            can_read : {
                type: Boolean,
                default: false
            },
            created_at: {
                type: Date,
                default: Date.now()
            },
            modified_at : {
                type: Date,
                default: Date.now()
            }
        }
    },

}, {
    collection : 'staff_admin'
})

module.exports = mongoose.model('staff_admin', StaffAdminModel);