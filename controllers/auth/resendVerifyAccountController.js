const moment = require('moment');
const crypto = require('crypto');
require("dotenv").config();
const userModel = require("../../models/User");
const UserVerification = require('../../models/UserVerification');
const {emailTransport} = require("../../config/utility");

const resendVerifyAccountController = (req, res) => {

    const userEmail = req.params.email;

    const verifyCode = crypto.randomInt(0, 1000000);

    const token = crypto.randomBytes(32).toString("hex");

    const expireAt = moment(Date.now()).add(process.env.VERIFICATION_EMAIL_EXPIRES_AT, 'minutes').toDate();

    userModel.findOne({"email": userEmail})
    .exec()
    .then( userObj => {

        //let's update useer verification

        UserVerification.findOneAndUpdate(
            {userId: userObj._id},
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

            const emailToken = `https://account.paykonect.com/verify/${data.userId}/${data.token}`;

            //continue with verify email
            emailTransport.sendMail({
                from:  `${process.env.EMAIL_FROM}`,
                to: userObj.email,
                subject: `${process.env.APP_NAME} Email Confirmation`,
                template: 'verify-account',
                context: {
                    title: `${process.env.APP_NAME} Email Confirmation`,
                    email: userObj.email,
                    code : data.code,
                    uri: emailToken
                },
                attachments: [{
                    filename: 'logo.png',
                      path: './views/logo.png',
                     cid: 'logo'
              }],
            },
                (err , info) => {
                    if(err){
                        
                        return res.json({"error": `email error - ${err}`});
                        
                    }else{

                        return res.status(201).json(
                            {"token": emailToken}
                        );

                    }
                }
            );
            


        })
        .catch(err => {
            return res.json({"error": `eee${err}`})
        })

    })
    .catch(err => {
        return res.status(403).json({"error": `No User Found!`})
    })
}


module.exports = resendVerifyAccountController;