const jwt = require("jsonwebtoken")
const secretKey = process.env.SECRET_KEY

// VERIFY TOKEN MIDDLEWARE
module.exports.authRequired = (req, res, next) => {
    // Get AUTH header value
    const bearerHeader = req.headers["authorization"]

    if (typeof bearerHeader !== 'undefined') {
        const bearer = bearerHeader.split(' ')
        const bearerToken = bearer[1]

        jwt.verify(bearerToken, secretKey, (error, user) => {
            if (error) { return res.sendStatus(403); }

            req.user = user;
            next();
        });
    } else {
        res.status(403).json({ message: "Forbidden" })
    }
}