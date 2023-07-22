const userModel = require("../../models/User");
const bcrypt = require('bcrypt');
const {emailTransport} = require("../../config/utility");
const path = require('path');
const crypto = require('crypto');
const hbs = require("nodemailer-express-handlebars");
const moment = require('moment');
const UserVerification = require("../../models/UserVerification");
require("dotenv").config();

const handlebarOptions = {
    viewEngine: {
        extName: ".handlebars",
        partialsDir: path.resolve('./views'),
        defaultLayout: false,
    },
    viewPath: path.resolve('./views'),
    extName: ".handlebars",
}

emailTransport.use('compile', hbs(handlebarOptions));

const registerUser = (req, res, next) => {
    
    const {email, password, re_password} = req.body;

    const verifyCode = crypto.randomInt(0, 1000000);

    const token = crypto.randomBytes(32).toString("hex");

    const expireAt = moment(Date.now()).add(process.env.VERIFICATION_EMAIL_EXPIRES_AT, 'minutes').toDate();
    
    if(re_password != password){
        
        return res.json({"error": "Password do not match"});
        
    }else{
        

        const saltRounds = 13;

        const hashedPassword = bcrypt.hashSync(password, saltRounds);

        userModel.findOne({email: email.toLowerCase()}).exec()
        .then( response => {
            if(response == null){


                userModel.create({
                    email: email,
                    password: hashedPassword
                })
                    .then( userObj => {
                        //create new user


                        UserVerification.create({
                            userId: userObj._id,
                            code : verifyCode,
                            token: token,
                            expire_at: expireAt
                        })
                        .then( saved => {

                            const emailToken = `https://account.paykonect.com/verify/${userObj._id}/${saved.token}`;

                            emailTransport.sendMail({
                                from: `${process.env.EMAIL_FROM}`,
                                to: userObj.email,
                                subject: `${process.env.APP_NAME} Email Confirmation `,
                                template: 'verify-account',
                                context: {
                                    title: `${process.env.APP_NAME} Confirmation Email`,
                                    email: userObj.email,
                                    code : saved.code,
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
                                        console.log(err);
                                    }else{
                                        console.log(info.messageId);
                                    }
                                }
                            )

                            if(token){

                                res.user = userObj._id.toString()
                                
                                return res.json({"token": emailToken})

                            }else{
                                
                                return res.json({"error": "Failed to create token"});
                            }

                        })
                        .catch( err => {
                            return res.json({"error": `Error occurred - ${err}`})
                        })
                        
                    })
                    .catch( err => {

                        return res.json({"err": `Failed to create user ${err}`});

                    })

            }
            else if(response.email == email.toLowerCase() && response.is_verified == false){

                UserVerification.findOneAndUpdate(
                    {userId: response._id},
                    {
                        "$set": {
                            code: verifyCode,
                            expire_at: expireAt,
                            create_at : Date.now(),
                            token: token
                        }
                    }, {
                        returnOriginal: false
                    }
                )
                .exec()
                .then( data => {

                    const emailToken = `https://account.paykonect.com/verify/${data.userId}/${data.token}`;

            //continue with verify email
            emailTransport.sendMail({
                from:  `${process.env.EMAIL_FROM}`,
                to: response.email,
                subject: `${process.env.APP_NAME} Email Confirmation `,
                template: 'verify-account',
                context: {
                    title: `${process.env.APP_NAME} Email Confirmation `,
                    email: response.email,
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
                .catch( err => {
                    console.log(err);
                })
            }
            else{

                return res.json({"error": "Email account already exist"})

            }
        })
        .catch( err => {
            return res.json({'error': `Error ${err}`})
        })
    }

}

module.exports = registerUser;