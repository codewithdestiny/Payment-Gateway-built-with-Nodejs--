const userModel = require("../../models/User");

const bcrypt = require('bcrypt');

const {emailTransport} = require("../../config/utility");

const changePassword = (req, res) => {

    if(!req.body){

        return res.status(403).json({"error": "Invalid payload supplied"});

    }

    const {oldPassword, newPassword, confirmNewPassword} = req.body;

    const hashedNewPassword = bcrypt.hashSync(newPassword, 13);

    if(!oldPassword || !newPassword || !confirmNewPassword){
        
        return res.status(400).json({"error": "Empty data input"});

    
    }else if(confirmNewPassword !== newPassword){
        return res.status(400).json({"error": "New Password do not match"});
    }
    else{

        userModel.findOne({"_id": res.locals.user})
        .exec()
        .then( userObj => {
    
            const comparePwd = bcrypt.compareSync(oldPassword, userObj.password);
    
            if(!comparePwd){
                return res.status(403).json({"error": "Old password do not match"});
            }
            else{
                
                userModel.updateOne(
                    {"_id": res.locals.user}, 
                    {
                        "$set": {
                            "password": hashedNewPassword
                        }
                    }
                )
                .then( response => {

                    emailTransport.sendMail({
                        from: `${process.env.EMAIL_FROM}`,
                        to: response.email,
                        subject: `${process.env.APP_NAME} Password Notification `,
                        template: 'change-password-template',
                        context: {
                            title: `${process.env.APP_NAME} Password Notification`,
                            supportTeam: `${process.env.SUPPORT_TEAM_EMAIL}`,
                            email: response.email,
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

                    return res.status(201).json({"message": "Password successfully changed"});

                })
                .catch( err => {

                    return res.status(401).json({"error": "Failed to change your password"});

                })

            }
            
        })
        .catch( err => {
            console.log(err)
        })
        
    }


    

    

}

module.exports = changePassword