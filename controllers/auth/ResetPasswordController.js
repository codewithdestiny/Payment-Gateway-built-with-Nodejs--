const userPasswordVerification = require("../../models/UserPasswordVerification");
const userModel = require("../../models/User");
const moment = require('moment');
const bcrypt = require('bcrypt');
const jsonwebtoken = require('jsonwebtoken');
require("dotenv").config();

const resetPassword = (req, res, next) => {

    const {userId, token} = req.params;

    const {password, re_password} = req.body;
    

    if(userId == "" || token == ""){
        return res.status(401).json({"error": "Invalid or empty payload request"});
        
    }

    else if(re_password !== password){
        return res.status(401).json({"error": "Password do not match"});
    }

    else{

        userPasswordVerification.findOne({"userId": userId, "token": token})
        .then ( response => {

            if(response.userId == userId && response.token == token && moment(Date.now()).diff(response.expire_at, 'minute') <= 0){

                console.log(moment(Date.now()).diff(response.expire_at, 'minute'))

                //update user password

                //encrypt the password with a saltRounds
                const saltRounds = 13;
                const hashPassword = bcrypt.hashSync(password, saltRounds);
        
                userModel.findOneAndUpdate(
                    {"_id": userId},
                    {
                        "$set": {
                            "password": hashPassword,
                            "is_active": true,
                            "login_attempt": 0,
                            "why_disabled": {
                                "invalid_login": false
                            }
                        }
                    },
                    {
                        returnOriginal: false
                    }
                )
                .then (data => {

                    userPasswordVerification.findOneAndUpdate(
                        {"userId": userId, "token": token},
                        {
                            "$set": {
                                "token": "",
                                "expire_at": ""
                            }
                        },{
                            returnOriginal: false
                        }
                    )
                    .then( verified => {

                        emailTransport.sendMail({
                            from: `${process.env.EMAIL_FROM}`,
                            to: data.email,
                            subject: `${process.env.APP_NAME} Password Reset Successful `,
                            template: 'password-change-success-template',
                            context: {
                                title: `${process.env.APP_NAME} Password Reset Successful`,
                                supportTeam: `${process.env.SUPPORT_TEAM_EMAIL}`,
                                email: data.email,
                                ipAddress: req.socket.remoteAddress,
                                when: moment().format("dddd, MMMM Do YYYY, h:mm:ss a"),
                                browsername : req.headers["user-agent"],
                                appName : `${process.env.APP_NAME}`
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
                        

                        //automatic login after password reset
                        const access_token = jsonwebtoken.sign(
                            {user: data._id},
                            process.env.ACCESS_TOKEN_SECRET_KEY,
                            {algorithm: process.env.ALGORITHM, expiresIn: `${process.env.ACCESS_TOKEN_EXPRES_MINUTES}`}
                        );

                        //send password reset successful

                        return res.status(201).json(
                            {
                                "success": "Your password reset was successful",
                                "access_token": access_token
                            }
                        );
                    })
                    .catch( err => {
                        return res.status(401).json({"error": "Failed to update user"})
                    })

                })
                .catch( err => {
                    return res.status(403).json({"error": `Error occurred - ${err}`});
                })

            }else{
                return res.status(403).json({"error": "Invalid URL supplied or User not Found!"});
            }
        })
        .catch( err => {
            return res.status(401).json({"error": `Invalid reset Password URL`});
        })

    }



    console.log(userId, token)


}

module.exports = resetPassword;