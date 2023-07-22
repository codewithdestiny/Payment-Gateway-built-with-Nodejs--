const jsonwebtoken = require('jsonwebtoken');
require("dotenv").config();
const userModel = require("../../models/User");
const UserVerification = require('../../models/UserVerification');
const moment = require('moment');

const verifyAccountByURI = (req, res, next) => {

    const userId = req.params.id;

    /**
     * The token represent either Code or The String Token
     */

    var token = req.params.token; 

    if(userId == "" || token == ""){
        return res.status(401).json({"error": "Invalid or empty payload"});
    }

    UserVerification.findOne({"userId": userId})
    .exec()
    .then( (data) => {

        console.log(moment(Date.now()).diff(data.expire_at, 'minute'), 483)

        if(data.userId == userId && data.token == token && moment(Date.now()).diff(data.expire_at, 'minute') <= 0){

            userModel.updateOne(
                {_id: userId},
                {
                    "$set": {
                        is_verified: true
                    }
                }
            ).exec()
            .then ( response => {

                if(response.is_verified == true){

                    return res.json({"message": "email already verified"});

                }else{

                    UserVerification.updateOne(
                        {userId: userId},
                        {
                            "$set": {
                                token: '', 
                                code: ''
                            }
                        }
                    ).exec()
                    .then( success => {

                        //send welcome email message
                        //

                        console.log(userId);

                        const access_token = jsonwebtoken.sign(
                            {user: userId},
                            process.env.ACCESS_TOKEN_SECRET_KEY,
                            {algorithm: process.env.ALGORITHM, expiresIn: `${process.env.ACCESS_TOKEN_EXPRES_MINUTES}`}
                        )
                        return res.status(201).json({"access_token": access_token})
                    
                    })
                    .catch( err => {

                        return res.json({"error": `Error - ${err}`});
                        
                    })
                }
               

            })
            .catch( err => {
                return res.status(201).json({"error": `Error ${err}`});
            })
        }
        else if(data.userId == userId && data.code == token && moment(Date.now()).diff(data.expire_at, 'minute') <= 0){

            userModel.updateOne(
                {_id: userId}, 
                {
                    "$set": {
                        is_verified: true
                    }
                }).exec()
            .then ( response => {

                if(response.is_verified == true){

                    return res.json({"message": "email already verified"});

                }else{

                    UserVerification.updateOne({userId: data.userId, token: '', code: ''}).exec()
                    .then( success => {

                        console.log(userId);

                        const access_token = jsonwebtoken.sign(
                            {user: userId},
                            process.env.ACCESS_TOKEN_SECRET_KEY,
                            {algorithm: process.env.ALGORITHM, expiresIn: "30m"}
                        )
                        return res.status(201).json({"access_token": access_token})
                    
                    })
                    .catch( err => {

                        return res.json({"error": `Error - ${err}`});
                        
                    })
                }

            })
            .catch( err => {

                return res.status(201).json({"error": `${err}`});

            })

        }
        else{

            return res.status(403).json({"error": "Token or Code is expired, regenerate"});

        }
    })
    .catch( err => {

        return res.status(403).json({"error": "User with Token Not Found"});
        
    })
    
}


module.exports = verifyAccountByURI;