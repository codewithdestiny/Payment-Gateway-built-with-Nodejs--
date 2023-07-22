const userModel = require("../../models/User");

const deleteUser = (req, res) => {

    const userId = res.locals.user;

    if(userId == ""){
        return res.status(401).json({"error": "Invalid or Empty user "});
    }

    userModel.deleteOne({"_id": userId})
    .then( deletedObj => {
        return res.status(201).json({"success": "FareWell, your account has been deleted"})
    })
    .catch ( err => {
        return res.status(307).redirect('/login')
    })
}


module.exports = deleteUser;