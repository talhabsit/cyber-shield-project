const mysql = require("mysql2");

const connection = mysql.createConnection({

    host: "localhost",
    user: "root",
    password: "",
    database: "cyber_shield"

});

connection.connect((error) => {

    if (error) {
        console.log("MySQL Connection Failed");
        console.log(error);
    } else {
        console.log("MySQL Connected");
    }

});

module.exports = connection;