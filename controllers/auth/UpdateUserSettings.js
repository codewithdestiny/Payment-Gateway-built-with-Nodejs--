const User = require("../../models/User");
require("dotenv").config();
const {emailTransport} = require("../../config/utility");

const updateUserSettings = (req, res) => {

    if(req.body == ""){
        return res.status(401).json({"error": "Empty request"})
    }

    const {firstname, username, lastname, phone_no, email} = req.body;

    const userId = res.locals.user;

    User.findOneAndUpdate(
        {"_id": userId},
        {
            "$set": {
                "firstname": firstname,
                "lastname": lastname,
                "username": username,
                "phone_no": phone_no,
                "email": email
            }
        }, {
            returnOriginal: false
        }
    )
    .then( userObj => {

        emailTransport.sendMail({
            from: `${process.env.EMAIL_FROM}`,
            to: userObj.email,
            subject: `${process.env.APP_NAME} Profile Update `,
            template: 'profile-update-template',
            context: {
                title: `${process.env.APP_NAME} Profile Update`,
                supportTeam: `${process.env.SUPPORT_TEAM_EMAIL}`,
                email: userObj.email,
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

        return res.status(201).json({"success": "You profile update was successful"})

    })
    .catch( err => {
        return res.status(403).json({"error": `${err}`})
    })
}

module.exports = updateUserSettings;