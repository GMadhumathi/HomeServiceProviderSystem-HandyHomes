const express = require("express");
const verifyToken = require("./verifyToken"); // Import middleware
const router = express.Router();

router.get("/admin/dashboard", verifyToken, (req, res) => {
    // if (req.user.role !== "admin") 
    if(!req.user || req.user.role !== "admin"){
        return res.status(403).json({ error: "Access denied" });
    }     

    res.json({ message: "Welcome to Admin Dashboard" });
});

module.exports = router;
