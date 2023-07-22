const mongoose = require('mongoose');

const userModel = require("../models/User");

const userVerification  = require("../models/UserVerification");

require("dotenv").config();

const nodemailer = require('nodemailer');

const cron = require('node-cron');

const whitelist = ["http://localhost:3500", "https://www.account.kryptoapi.com", "http://localhost:3000"];

const browser = require("browser-detect");

const moment = require('moment');

var corsOptions = {
    origin: (origin, callback) => {
        if(whitelist.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        }else{
            callback(new Error('Not allowed by Cors'));
        }
    },
    optionsSuccessStatus: 200
}

const connectDb = async () => {
    try{
       const db = await mongoose.connect(process.env.DATABASE_URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
       });

        return db
        
    }catch(err){
        console.error(err);
    }
}

const emailTransport = nodemailer.createTransport({
    secure: true,
    host: 'smtp.gmail.com',
    port: 465,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    }
});


const unverifyAccountMessenger = () => {

    /* 
    Cron job to automatically 
    send email to users telling them to continue 
    to complete the verification to enjoy our services   
    4-11 2 between 4-11 of every 2 days 
        4-11 2  
    */

    cron.schedule("* 4-11 2 * * *", () => {

        var userMap = [];

        userModel.find({})
        .exec()
        .then( users => {
            users.forEach( user => {
                if(user.is_verified == false){
                    userMap.push(user.email);
                }
            })

            console.log(userMap);

            emailTransport.sendMail({
                from:  `${process.env.EMAIL_FROM}`,
                to: userMap,
                subject: `${process.env.APP_NAME} Email Confirmation `,
                template: 'email-verify-reminder',
                context: {
                    title: `${process.env.APP_NAME} Confirmation Email`,
                },
                attachments: [{
                    filename: 'logo.png',
                        path: './views/logo.png',
                        cid: 'logo'
                }],
            },
                (err , info) => {
                    if(err){
                        
                        console.error(`${err}`);
                        
                    }else{

                        console.log("all users will be reminded");

                    }
                }
            );

        })
        .catch( err => {
            console.error(err)
        })
    });

    // cron.schedule("* 3 * * * *", () => {
        
    //     /*
    //         Schedule login attempt reset every 2 hours
    //     */

       
    //    userModel.find({})
    //    .then( users => {
           
    //        users.forEach( user => {
    //            if (user.login_attempt < 5){
                   
    //                userVerification.findOne({"userId": user._id})
    //                .then( data => {

    //                 if(moment().diff(data.create_at, "minute") >= 0)

    //                    userModel.updateOne({"_id": user._id}, {"login_attempt": 0} )
    //                    .then( res => console.log(`${res} yes`))
    //                    .catch(err => console.log(`${err} no`))

    //                })
    //                .catch( err => {

    //                     console.log(`${err}`);

    //                })


    //             }
    //         })

    //     })
    // })
}


unverifyAccountMessenger();


module.exports = {corsOptions, connectDb, emailTransport};