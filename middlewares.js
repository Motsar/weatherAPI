require('dotenv').config();

const verifyToken = async function (req, res, next) {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ "error": "Missing Authorization header!" });
    const headerToken = token.split(' ');
    if (!headerToken[1]) return res.status(400).json({ "error": "Invalid Authorization header format!" });
    if(headerToken[1]!=process.env.ACCESSKEY) return res.status(401).json({ "error": "Invalid token!" })
    try {
        next();
    } catch (err) {
        res.status(401).json({ "error": "Invalid token" });
    }
};

module.exports.verifyToken = verifyToken;