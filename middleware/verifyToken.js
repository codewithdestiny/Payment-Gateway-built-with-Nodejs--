const jsonwebtoken = require('jsonwebtoken');
const userModel = require("../models/User");

const verifyJwtAuthToken = (req, res, next) => {
    //verify the jwt first before decrypting
    
    const authHeader = req.headers['authorization'];

    if(!authHeader) return res.sendStatus(401);
    
    console.log(authHeader); //Bearer token

    const token = authHeader.split(' ')[1];

    jsonwebtoken.verify(
        token,
        process.env.ACCESS_TOKEN_SECRET_KEY,
        (err, decoded) => {

            if(err) return res.status(403).json({"error": `Error Occurred -${err}`})

            res.locals.user = decoded.user

            userModel.findOne({"_id": decoded.user})
            .then( (user) => {
                if(user.is_active === true && user.is_verified === true && user.why_disabled.invalid_login === false){
                        next();
                }
                else{
                    return res.json({"error": "Account temporarily disabled or blocked! Contact Us"})
                
                }
            })
            .catch(err => {
                console.log(`Error occurred during JWT auth verification ${err}`)
            })
                

        }
                
        )
        

}


module.exports = verifyJwtAuthToken;