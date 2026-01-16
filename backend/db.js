    const mysql = require("mysql");

    var con = mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "",
        database: "home_service"
    });

    con.connect(function (err) {
        if (err) throw err;
        console.log("Connected to MySQL");
    });

    module.exports = con; // Export the connection
