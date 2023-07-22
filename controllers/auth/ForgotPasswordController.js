const userModel = require("../../models/User");
const {emailTransport} = require("../../config/utility");
const UserPasswordVerification = require("../../models/UserPasswordVerification");
const crypto = require('crypto');
const moment = require('moment');
require("dotenv").config();
const os = require('os');
const browser = require('browser-detect')

const forgotPassword = (req, res) => {

    const {email} = req.body;

    const verifyCode = crypto.randomInt(0, 1000000);

    const token = crypto.randomBytes(32).toString("hex");

    const expireAt = moment(Date.now()).add(process.env.VERIFICATION_EMAIL_EXPIRES_AT, 'minutes').toDate();

    userModel.findOne({"email": email})
    .exec()
    .then( userObj => {
        
        //Todo 
        // Send URL to the email

        if(userObj.email == email){

            //update userverification link
            UserPasswordVerification.create({
                    userId : userObj._id,
                    token: token,
                    create_at : moment(),
                    expire_at: expireAt
                }

            )
            .then( data => {

                const emailToken = `https://account.paykonect.com/verify/${data.userId}/${data.token}`;

                //continue with verify email
                emailTransport.sendMail({
                    from:  `${process.env.EMAIL_FROM}`,
                    to: userObj.email,
                    subject: `${process.env.APP_NAME} Password Reset`,
                    template: 'reset-password-template',
                    context: {
                        title: `${process.env.APP_NAME} Password Reset`,
                        email: userObj.email,
                        action_url: emailToken,
                        firstname: userObj.firstname ? userObj.firstname : userObj.email.split('@')[0],
                        app_name : `${process.env.APP_NAME}`,
                        browser_name: req.headers['user-agent'],
                        support_url: `${process.env.SUPPORT_TEAM_EMAIL}`,
                    },
                    attachments: [{
                        filename: 'logo.png',
                        path: './views/logo.png',
                        cid: 'logo'
                }],
                },
                    (err , info) => {
                        if(err){
                            
                            console.log({"error": `email error - ${err}`});
                            
                        }else{

                            console.log(info.messageId)

                        }
                    }
                );

                return res.status(201).json(
                    {"reset-password-uri": emailToken}
                );

            })
            .catch( errObj => {
                return res.status(401).json({"error": `${errObj}`})
            })
            
            
        }

        

    })
    .catch( err => {
        return res.status(401).json({"error": "You'll recieve an email shortly If this email is found!"})
    })

    

}
module.exports = forgotPassword;