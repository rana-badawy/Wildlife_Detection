const mysql = require('mysql');

// Connecting to database
//ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'password';
//flush privileges;

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    port: 3306,
    password: "admin",
    database: "wildlife"
});

connection.connect(function (err) {
    if (err) {
        console.log("Error in the connection")
        console.log(err)
    }
    else {
        console.log('Database Connected');
    }
});

module.exports = connection;