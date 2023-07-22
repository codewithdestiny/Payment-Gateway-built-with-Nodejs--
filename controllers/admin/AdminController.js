const bcrypt = require("bcrypt");
const AdminStaff = require("../../models/AdminStaff");
require("dotenv").config();
const {emailTransport} = require("../../config/utility");
const moment = require("moment");

const AdminController = {

    createAdmin : (req, res) => {

        const {email, password} = req.body;

        if(email == "" || password == "" || !email || !password){
            return res.status(400).json({"error": "email & password are required"});
        }

        else if(email.indexOf('@')  === -1 || email.split('@')[1] !== `${process.env.SITE_URL}`){
            return res.status(401).json({"error": "Invalid email address"})
        }

        else{

            const userName = email.split('@')[0];

        const saltRound = 13;

        const hashPassword = bcrypt.hashSync(password, saltRound);

            AdminStaff.findOne({"email": email})
            .then(response => {
                if(response == null){

                    //create new staff
    
                    AdminStaff.create({email: email, is_verified: true, username: userName, password: hashPassword, is_admin: true })
                    .then ( createdUser => {
                        return res.status(200).json({"success": "New Admin created!"});
                    })
                    .catch(err => {
                        return res.status(401).json({"error": "An error occurred!"+ `${err}`})
                    })

                }else{

                    AdminStaff.find()
                    .then (admins => {
                        admins.forEach(admin => {
                            if(admin.is_admin == true){
                                return res.status(401).json({"error": "Sorry! Only 1 Super Admin is allowed"});
                            }
                        })
                    })
                    .catch(err => console.log(`${err}`))

                }
            })

        }

    },

    loginAdmin: (req, res) => {
        const {username, password} = req.body;

        
        AdminStaff.findOne({"username": username})
        .then( response => {
            const comparePassword = bcrypt.compareSync(password, response.password);

            if(!comparePassword){
                if(response.login_attempt < 3){
                    //send email to Admin Personal Email
                    AdminStaff.findOneAndUpdate(
                        {"_id": response._id}, 
                        {
                            "login_attempt": response.login_attempt + 1,
                            "why_disabled": {
                                "invalid_login": true
                            }
                        }, 
                        {returnOriginal: false}
                    )
                    .then( upResponse => {
                        console.log(response.login_attempt)
                        return res.json({"error": `Invalid Admin Credentials ${3 - response.login_attempt} of 3 attempt left`})
                    })
                    .catch( upErr => {
                        return res.status(401).json({"error": `Error occurred - ${upErr}`})
                    })

                } else if(response.login_attempt == 3){
                    return res.json({"error": "Account Disabled, please reset password"})
                }
                else{
                    AdminStaff.findOneAndUpdate({"_id": response._id}, {"login_attempt": response.login_attempt + 1}, {returnOriginal: false})
                    .then( upResponse => {
                        return res.json({"error": `Invalid Admin Credentials ${3 - response.login_attempt} of 3 attempt left`})
                    })
                    .catch( upErr => {
                        return res.status(401).json({"error": `Error occurred - ${upErr}`})
                    })

                }
            }else{
                //Send email to admin Email log Admin In

                
                emailTransport.sendMail({
                    from: `${process.env.EMAIL_FROM}`,
                    to: response.email,
                    subject: "Login Verification ",
                    date: moment(),
                    sender: `${process.env.WEBMASTER_EMAIL}`,
                    attachDataUrls: true,
                    template: `login-confirmation`,
                    context: {
                        title : `${process.env.APP_NAME} Login Confirmation`,
                        email: response.email,
                        code: ''
                    }
                    

                }, (err, info) => {
                    if(err) throw err;
                    console.log(info.messageId)
                })

            }

        })
        .catch(err => {
            return res.status(401).json({"error": "Admin Not Found!"})
        })

    },

    changePassword: (req, res) => {

    }

}


module.exports = AdminController;