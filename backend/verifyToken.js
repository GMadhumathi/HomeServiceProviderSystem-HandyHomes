require("dotenv").config();
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(403).json({ error: "Access denied" });
    }

    const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
    
    try {
        const verified = jwt.verify(token, process.env.SECRET_KEY); // Verify token
        req.user = verified; // Attach user info to request
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
};
