const jsonwebtoken = require('jsonwebtoken')
const userModel = require('../../models/User')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const {emailTransport} = require("../../config/utility");
const moment = require('moment');
const UserVerification = require("../../models/UserVerification");
require("dotenv").config();
const crypto = require('crypto');


const loginUser = async (req, res) => {
    const {username, password} = req.body;

    try{
        /*
            username - email, phone No, username in 
            combination with his password
        */ 
        if(!username && !password || !password || !username){
            return res.status(400).json({"error": "user credentials  required"})
        }
        const userWithEmail = await userModel.findOne({"email": username});
        const userWithPhone = await userModel.findOne({"phone_no": username});

        const userWithId = await userModel.findOne({"username": username});

        const verifyCode = crypto.randomInt(0, 1000000);

        const token = crypto.randomBytes(32).toString("hex");

        const expireAt = moment(Date.now()).add(process.env.VERIFICATION_EMAIL_EXPIRES_AT, 'minutes').toDate();

        const userInstance = userWithEmail || userWithPhone  || userWithId;

            if(userInstance){

                const comparePwd = bcrypt.compareSync(password, userInstance.password)

                if(!comparePwd){

                    if(
                        !userInstance.is_active && 
                        userInstance.login_attempt == 5 && 
                        userInstance.why_disabled.invalid_login == true
                    ){
                        
                        return res.status(401).json(
                            {
                                "error": "User has been blocked",
                                "reason": "Login attempt exceeded, Do forgot password"
                            }
                        )
                    }
                    else if(!userInstance.is_active && userInstance.why_disabled.others){
                        return res.status(403).json({
                            "error": "User has been blocked",
                            "reason": "Other reasons by the admin"
                        })
                    }
                    else if(userInstance.login_attempt < 5){

                        if(userInstance.login_attempt == 1){
                            /*
                                Send Email to Account Owner, 
                                creating awareness of Login Attempt. Was that instantiated by you. If Forgot Password
                                Reset else If not you, contact Us.
                                wait for the next 5 minutes,
                                10 min
                                35 min
                            */
                                emailTransport.sendMail({
                                    from: `${process.env.EMAIL_FROM}`,
                                    to: userInstance.email,
                                    subject: `Failed Login Attempt `,
                                    template: 'failed-login-attempt',
                                    context: {
                                        title: `${process.env.APP_NAME} Failed Login Attempt`,
                                        email: userInstance.email,
                                        date : moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                                        ipAddress : req.socket.remoteAddress
                                    },
                                    attachments: [{
                                        filename: 'logo.png',
                                          path: './views/logo.png',
                                         cid: 'logo'
                                    },{
                                        filename: 'forgot-pwd-img.png',
                                        path: './views/images/forgot-pwd-img.png',
                                        cid: 'forgot-pwd-img'
                                    }],
                                    },
                                    (err , info) => {
                                        if(err){
                                            console.log(err);
                                        }else{
                                            console.log(info.messageId);
                                        }
                                    }
                                )
                            
                        }
                        userInstance.login_attempt += 1
                        userInstance.save()
                        return res.status(400).json({"error": `Incorrect user credential, login trial${(userInstance.login_attempt != 1 ? 's' : '' )} ${5 - userInstance.login_attempt} of 5 left - Try forgot Password`})

                    }
                    else {

                        userInstance.is_active = false;

                        userInstance.why_disabled.invalid_login = true;

                        userInstance.save();

                        return res.status(403).json(
                            {
                                "error": "User has been blocked",
                                "reason": "Login attempt exceeded, Do forgot password"
                            }
                        )
                    }
                
                }

                else if(userInstance.is_active == true && userInstance.is_verified == true){
                    payload = { "user_id": userInstance._id }

                        if(userInstance.is_otp_enabled){
                            console.log(userInstance.is_otp_enabled)
                        }else{

                            const userVerify = await UserVerification.findOneAndUpdate(
                                {userId: userInstance._id},
                                {
                                    "$set": {
                                        code: verifyCode,
                                        token: token,
                                        create_at : moment(),
                                        expire_at: expireAt
                                    }
                                },{
                                    returnOriginal: false
                                }
                            )

                            await userModel.updateOne(
                                {"_id": userInstance._id},
                                {
                                    "$set": {
                                        "login_attempt": 0
                                    }
                                }

                            )
                            
                            emailTransport.sendMail({
                                from: `${process.env.EMAIL_FROM}`,
                                to: userInstance.email,
                                subject: `${process.env.APP_NAME} Login Confirmation `,
                                template: 'login-confirmation',
                                context: {
                                    title: `${process.env.APP_NAME} Login Confirmation`,
                                    email: userInstance.email,
                                    code : userVerify.code,
                                    ipAddress: req.socket.remoteAddress,
                                    when: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                                    browsername : req.headers["user-agent"],
                                },
                                attachments: [{
                                    filename: 'logo.png',
                                      path: './views/logo.png',
                                     cid: 'logo'
                                }],
                                },
                                (err , info) => {
                                    if(err){
                                        console.log(err);
                                    }else{
                                        console.log(info.messageId);
                                    }
                                }
                            )

                        }
    
                    /*
                        Refresh Token during registration and Login
                        
                        if 2FA google auth is enabled by user.
                        then, proceed it
                    */
    
                    return res.json({"user_id": userInstance._id, "message": "We sent you passcode to expire in 5 minutes"});
                    
                }else if(userInstance.is_active == false  && userInstance.is_verified == true && userInstance.why_disabled.invalid_login == true){


                    return res.status(403).json(
                        {
                            "error": "User has been blocked",
                            "reason": "Login attempt exceeded, Do forgot password"
                        }
                    )
                    
                }else{
                    
                    UserVerification.findOneAndUpdate(
                        {userId: userInstance._id},
                        {
                            "$set": {
                                code: verifyCode,
                                token: token,
                                create_at : moment(),
                                expire_at: expireAt
                            }
                        },{
                            returnOriginal: false
                        }
                    )
                    .exec()
                    .then( data => {
            
                        //continue with verify email
                        emailTransport.sendMail({
                            from:  `${process.env.EMAIL_FROM}`,
                            to: userInstance.email,
                            subject: `${process.env.APP_NAME} Login Confirmation`,
                            template: 'login-confirmation',
                            context: {
                                title: `${process.env.APP_NAME} Login Confirmation`,
                                email: userInstance.email,
                                code : data.code,
                            },
                            attachments: [{
                                filename: 'logo.png',
                                  path: './views/logo.png',
                                 cid: 'logo'
                          }],
                        },
                            (err , info) => {
                                if(err){
                                    
                                    console.log(`${err}`)
                                    
                                }
                                return res.status(201).json(
                                    {
                                        "userid": userInstance._id, 
                                        "message": "Unverified email, please follow the link sent to your email to verify."
                                    }
                                );
                            }
                        );
                        
            
            
                    })
                    .catch(err => {
                        return res.json({"error": `eee${err}`})
                    })
                    
                }
                
            }
            else{
                return res.status(400).json({"error": `User Not Found!`})
            }
    }catch(err){

        console.error(err)
    }
}

module.exports = loginUser